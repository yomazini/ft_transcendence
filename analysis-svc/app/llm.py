import json
import logging
import re
from typing import Any

import httpx

from .config import settings

logger = logging.getLogger("analysis-llm")

FALLBACK_MODELS = [
    "google/gemma-3-27b-it:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "openrouter/free",
]


def _get_model_chain() -> list[str]:
    chain = [settings.openrouter_model]
    for m in FALLBACK_MODELS:
        if m not in chain:
            chain.append(m)
    return chain


def strip_thinking(raw_text: str) -> str:
    cleaned = re.sub(r"<think>.*?</think>", "", raw_text, flags=re.DOTALL)
    return cleaned.strip()


def extract_json_object(raw_text: str) -> dict[str, Any]:
    cleaned = strip_thinking(raw_text)
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in LLM output")

    parsed: Any = json.loads(cleaned[start : end + 1])
    if not isinstance(parsed, dict):
        raise ValueError("LLM output is not a JSON object")
    return parsed


async def _post_completion(
    client: httpx.AsyncClient,
    model: str,
    prompt: str,
    max_tokens: int,
    temperature: float,
    json_mode: bool,
) -> str:
    url = f"{settings.openrouter_base_url.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
    }
    body: dict[str, Any] = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if json_mode and not model.endswith(":free"):
        body["response_format"] = {"type": "json_object"}

    response = await client.post(url, headers=headers, json=body)
    response.raise_for_status()
    data = response.json()
    choices = data.get("choices") or []
    if not choices:
        raise ValueError("Empty choices from OpenRouter")
    content = choices[0].get("message", {}).get("content") or ""
    if not content:
        raise ValueError("Empty message content from OpenRouter")
    return str(content)


async def call_openrouter_json(
    prompt: str,
    max_tokens: int = 3072,
    temperature: float = 0.3,
) -> dict[str, Any] | None:
    if not settings.openrouter_api_key:
        logger.info("No OPENROUTER_API_KEY configured; skipping LLM call")
        return None

    models = _get_model_chain()
    async with httpx.AsyncClient(timeout=settings.openrouter_timeout) as client:
        for model in models:
            for attempt in range(2):
                try:
                    raw = await _post_completion(
                        client=client,
                        model=model,
                        prompt=prompt,
                        max_tokens=max_tokens,
                        temperature=temperature,
                        json_mode=True,
                    )
                    parsed = extract_json_object(raw)
                    logger.info("OpenRouter JSON synthesis succeeded with %s", model)
                    return parsed
                except httpx.HTTPStatusError as e:
                    status = e.response.status_code
                    logger.warning(
                        "OpenRouter HTTP %s on %s (attempt %d)",
                        status,
                        model,
                        attempt + 1,
                    )
                    break
                except Exception as e:
                    logger.warning(
                        "OpenRouter parse/error on %s (attempt %d): %s",
                        model,
                        attempt + 1,
                        e,
                    )
    return None


async def call_openrouter_text(
    prompt: str,
    max_tokens: int = 768,
    temperature: float = 0.2,
) -> str | None:
    if not settings.openrouter_api_key:
        logger.info("No OPENROUTER_API_KEY configured; skipping LLM text call")
        return None

    models = _get_model_chain()
    async with httpx.AsyncClient(timeout=settings.openrouter_timeout) as client:
        for model in models:
            try:
                raw = await _post_completion(
                    client=client,
                    model=model,
                    prompt=prompt,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    json_mode=False,
                )
                return strip_thinking(raw)
            except Exception as e:
                logger.warning("OpenRouter text call failed on %s: %s", model, e)
    return None
