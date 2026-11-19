import json
import logging
import re
import time
from typing import Any

import httpx

from .config import settings
from .metrics import analysis_llm_duration, analysis_llm_requests

logger = logging.getLogger("analysis-llm")


class LLMError(Exception):
    """A safe LLM failure that the API can return to the caller."""

    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


class EmptyCompletionError(Exception):
    """OpenRouter returned no usable message; this can be transient."""


def _http_error(status: int) -> LLMError:
    if status == 401:
        return LLMError("OpenRouter API key is invalid", 503)
    if status == 402:
        return LLMError("OpenRouter account has no credit", 503)
    if status == 403:
        return LLMError("OpenRouter key cannot use this model", 503)
    if status == 429:
        return LLMError("OpenRouter rate limit reached", 503)
    return LLMError("OpenRouter request failed", 502)


def _record_llm(model: str, status: str, started: float) -> None:
    analysis_llm_requests.labels(model=model, status=status).inc()
    analysis_llm_duration.labels(model=model).observe(time.perf_counter() - started)


def _get_model_chain() -> list[str]:
    chain = [settings.openrouter_model]
    for m in settings.openrouter_fallback_models.split(","):
        m = m.strip()
        if m and m not in chain:
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
        raise TypeError("LLM output is not a JSON object")
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
    if json_mode:
        body["response_format"] = {"type": "json_object"}

    response = await client.post(url, headers=headers, json=body)
    response.raise_for_status()
    data = response.json()
    choices = data.get("choices") or []
    if not choices:
        raise EmptyCompletionError("Empty choices from OpenRouter")
    message = choices[0].get("message", {})
    # Some reasoning models put the answer in `reasoning`, not `content`.
    content = (
        message.get("content")
        or message.get("reasoning")
        or message.get("reasoning_content")
        or ""
    )
    if not content:
        raise EmptyCompletionError("Empty message content from OpenRouter")
    return str(content)


async def call_openrouter_json(
    prompt: str,
    max_tokens: int = 3072,
    temperature: float = 0.3,
) -> dict[str, Any]:
    if not settings.openrouter_api_key:
        raise LLMError("OpenRouter API key is not configured", 503)

    models = _get_model_chain()
    error_message = "LLM unavailable"
    error_status = 503
    async with httpx.AsyncClient(timeout=settings.openrouter_timeout) as client:
        for model in models:
            # Empty content can be transient; malformed JSON is not.
            attempts = 2 if model == models[0] else 1
            for attempt in range(attempts):
                started = time.perf_counter()
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
                    _record_llm(model, "success", started)
                    logger.info("OpenRouter JSON synthesis succeeded with %s", model)
                    return parsed
                except httpx.HTTPStatusError as e:
                    _record_llm(model, "error", started)
                    status = e.response.status_code
                    logger.warning(
                        "OpenRouter HTTP %s on %s (attempt %d)",
                        status,
                        model,
                        attempt + 1,
                    )
                    if status in (401, 402, 403, 429):
                        raise _http_error(status) from e
                    error_message = "OpenRouter request failed"
                    error_status = 502
                    break
                except (
                    httpx.TimeoutException,
                    httpx.NetworkError,
                    EmptyCompletionError,
                ) as e:
                    _record_llm(model, "error", started)
                    logger.warning(
                        "OpenRouter transient error on %s (attempt %d): %s",
                        model,
                        attempt + 1,
                        e,
                    )
                    if attempt + 1 >= attempts:
                        break
                except (json.JSONDecodeError, ValueError) as e:
                    # Malformed JSON is deterministic; retrying the same model
                    # only burns tokens and time.
                    _record_llm(model, "error", started)
                    logger.warning(
                        "OpenRouter invalid JSON on %s (attempt %d): %s",
                        model,
                        attempt + 1,
                        e,
                    )
                    error_message = "LLM returned invalid JSON"
                    error_status = 502
                    break
    raise LLMError(error_message, error_status)


async def call_openrouter_text(
    prompt: str,
    max_tokens: int = 768,
    temperature: float = 0.2,
) -> str:
    if not settings.openrouter_api_key:
        raise LLMError("OpenRouter API key is not configured", 503)

    models = _get_model_chain()
    error_message = "LLM unavailable"
    error_status = 503
    async with httpx.AsyncClient(timeout=settings.openrouter_timeout) as client:
        for model in models:
            started = time.perf_counter()
            try:
                raw = await _post_completion(
                    client=client,
                    model=model,
                    prompt=prompt,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    json_mode=False,
                )
                answer = strip_thinking(raw)
                if not answer:
                    raise EmptyCompletionError("Empty text after cleaning")
                _record_llm(model, "success", started)
                return answer
            except httpx.HTTPStatusError as e:
                _record_llm(model, "error", started)
                status = e.response.status_code
                logger.warning("OpenRouter HTTP %s on %s", status, model)
                if status in (401, 402, 403, 429):
                    raise _http_error(status) from e
                error_message = "OpenRouter request failed"
                error_status = 502
            except (
                httpx.TimeoutException,
                httpx.NetworkError,
                EmptyCompletionError,
            ) as e:
                _record_llm(model, "error", started)
                logger.warning("OpenRouter text call failed on %s: %s", model, e)
    raise LLMError(error_message, error_status)
