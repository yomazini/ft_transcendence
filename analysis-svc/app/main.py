import asyncio
import json
import logging
import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List

import hvac
from fastapi import FastAPI, HTTPException, Response
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
from pydantic import BaseModel

from .canvas import build_rag_prompt
from .config import settings
from .database import (
    close_pool,
    get_comments_by_job,
    get_job,
    get_report_by_job,
    insert_comment,
    insert_report,
    search_comments_by_vector,
    update_job_status,
)
from .embeddings import generate_embedding
from .events import close_redis, publish_job_event
from .llm import call_openrouter_text
from .metrics import http_duration, http_requests
from .ranking import rerank_for_rag
from .sentiment import compute_sentiment_summary, score_comments
from .synthesis import synthesize_full_report
from .worker import start_worker, stop_worker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("analysis-svc")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        with open("/run/vault/login.json") as f:
            creds = json.load(f)
        client = hvac.Client(url="http://vault:8200")
        client.auth.approle.login(
            role_id=creds["role_id"], secret_id=creds["secret_id"]
        )
        db = client.secrets.kv.v2.read_secret_version(
            path="database", mount_point="secret"
        )["data"]["data"]
        ai = client.secrets.kv.v2.read_secret_version(
            path="analysis-svc", mount_point="secret"
        )["data"]["data"]
        settings.postgres_password = db["password"]
        settings.openrouter_api_key = ai["openrouter_api_key"]
        logger.info("Loaded secrets from Vault")
    except Exception as e:
        logger.warning("Vault unavailable; using .env: %s", e)

    try:
        await start_worker()
    except Exception as e:
        logger.warning("BullMQ worker failed to start: %s", e)
    from .embeddings import warmup

    await asyncio.to_thread(warmup)
    yield
    await stop_worker()
    await close_redis()
    await close_pool()


app = FastAPI(title="analysis-svc", version="0.2.0", lifespan=lifespan)


@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.middleware("http")
async def metrics_middleware(request, call_next):
    if request.url.path == "/metrics":
        return await call_next(request)
    start = time.perf_counter()
    response = await call_next(request)
    route = request.scope.get("route")
    path = getattr(route, "path", request.url.path)
    labels = {"method": request.method, "route": path}
    http_requests.labels(
        method=request.method, route=path, status=str(response.status_code)
    ).inc()
    http_duration.labels(**labels).observe(time.perf_counter() - start)
    return response


class HealthResponse(BaseModel):
    status: str
    service: str


class AnalyzeStubRequest(BaseModel):
    job_id: str
    comments: List[str]


class SentimentRequest(BaseModel):
    comments: List[str]


class RagQueryRequest(BaseModel):
    job_id: str
    query: str


class CommentCitation(BaseModel):
    id: str
    job_id: str
    text: str
    author: str
    upvotes: int
    sentiment_score: float | None = None
    created_at: str | None = None


class RagQueryResponse(BaseModel):
    answer: str
    citations: List[CommentCitation]


@app.get("/health", response_model=HealthResponse)
async def health():
    return {"status": "ok", "service": "analysis-svc"}


@app.post("/analyze/test")
async def analyze_test_stub(payload: AnalyzeStubRequest):
    return {
        "job_id": payload.job_id,
        "processed_comments_count": len(payload.comments),
        "sentiment_summary": {
            "positive_ratio": 0.65,
            "neutral_ratio": 0.20,
            "negative_ratio": 0.15,
        },
        "status": "ready_for_synthesis",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/analyze/sentiment")
async def analyze_sentiment(payload: SentimentRequest):
    comments = [{"text": t, "author": "api", "upvotes": 0} for t in payload.comments]
    scored = score_comments(comments)
    summary = compute_sentiment_summary(scored)
    return {
        "comments": [
            {
                "text": c["text"],
                "compound": c["compound"],
                "pos": c["pos"],
                "neg": c["neg"],
                "neu": c["neu"],
                "subjectivity": c["subjectivity"],
                "subjectivity_label": c["subjectivity_label"],
            }
            for c in scored
        ],
        "summary": summary,
    }


@app.post("/analyze/{job_id}")
async def trigger_analysis(job_id: str):
    job = await get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    await update_job_status(job_id, "Running")
    await publish_job_event(job_id, "running")

    comments = await get_comments_by_job(job_id)
    if not comments:
        raise HTTPException(
            status_code=404, detail=f"No comments found for job {job_id}"
        )
    scored = score_comments(comments)
    summary = compute_sentiment_summary(scored)

    for comment in scored:
        embedding = await asyncio.to_thread(generate_embedding, comment["text"])
        await insert_comment(
            comment_id=comment["id"],
            job_id=job_id,
            text=comment["text"],
            author=comment["author"],
            upvotes=comment["upvotes"],
            sentiment_score=comment["compound"],
            embedding=embedding,
        )

    report_data = await synthesize_full_report(job, summary, scored)
    report_id = str(uuid.uuid4())

    await insert_report(
        report_id=report_id,
        job_id=job_id,
        swot=report_data["swot"],
        blue_ocean=report_data["blue_ocean"],
        conclusion=report_data["conclusion"],
    )

    await update_job_status(job_id, "Done")
    await publish_job_event(job_id, "done", {"report_id": report_id})

    return {
        "job_id": job_id,
        "status": "Done",
        "comments_processed": len(scored),
        "report_id": report_id,
        "sentiment_summary": summary,
    }


@app.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    job = await get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    return {
        "id": job["id"],
        "status": job["status"],
        "target": job["target"],
        "mode": job["mode"],
        "created_at": str(job["created_at"]),
    }


@app.get("/jobs/{job_id}/comments")
async def get_job_comments(job_id: str):
    comments = await get_comments_by_job(job_id)
    if not comments:
        raise HTTPException(
            status_code=404, detail=f"No comments found for job {job_id}"
        )
    return {"job_id": job_id, "count": len(comments), "comments": comments}


@app.get("/jobs/{job_id}/report")
async def get_job_report(job_id: str):
    report = await get_report_by_job(job_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"No report found for job {job_id}")
    return report


@app.post("/rag/query", response_model=RagQueryResponse)
async def query_rag(payload: RagQueryRequest):
    job = await get_job(payload.job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {payload.job_id} not found")

    query_vec = await asyncio.to_thread(generate_embedding, payload.query)
    candidates = await search_comments_by_vector(
        payload.job_id, query_vec, limit=settings.rag_top_k
    )
    if not candidates:
        raise HTTPException(
            status_code=404,
            detail=f"Target job vector data not found for job {payload.job_id}",
        )

    reranked = rerank_for_rag(candidates, top_k=settings.rag_top_k)
    prompt = build_rag_prompt(payload.query, reranked, job)

    with open("/tmp/rag_prompt.txt", "w", encoding="utf-8") as file:
        file.write(prompt)

    llm_answer = await call_openrouter_text(prompt, max_tokens=768, temperature=0.2)
    if not llm_answer or not llm_answer.strip():
        logger.error("RAG LLM failed for job %s", payload.job_id)
        raise HTTPException(status_code=502, detail="LLM unavailable")

    answer = llm_answer.strip()

    citations = [
        CommentCitation(
            id=str(c["id"]),
            job_id=str(c["job_id"]),
            text=str(c["text"]),
            author=str(c["author"]),
            upvotes=int(c.get("upvotes", 0)),
            sentiment_score=(
                float(c["sentiment_score"])
                if c.get("sentiment_score") is not None
                else None
            ),
            created_at=str(c.get("created_at") or ""),
        )
        for c in reranked
    ]

    return RagQueryResponse(answer=answer, citations=citations)
