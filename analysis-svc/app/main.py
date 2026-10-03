import logging
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .database import (
    close_pool,
    get_comments_by_job,
    get_job,
    get_report_by_job,
    insert_comment,
    insert_report,
    update_job_status,
)
from .embeddings import generate_embedding
from .fixtures import get_fixture_comments
from .sentiment import compute_sentiment_summary, score_comments
from .synthesis import generate_conclusion, synthesize_blue_ocean, synthesize_swot
from .worker import start_worker, stop_worker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("analysis-svc")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await start_worker()
    except Exception as e:
        logger.warning("BullMQ worker failed to start: %s", e)
    yield
    await stop_worker()
    await close_pool()


app = FastAPI(title="analysis-svc", version="0.2.0", lifespan=lifespan)


class HealthResponse(BaseModel):
    status: str
    service: str


class AnalyzeStubRequest(BaseModel):
    job_id: str
    comments: List[str]


class SentimentRequest(BaseModel):
    comments: List[str]


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

    comments = get_fixture_comments()
    scored = score_comments(comments)
    summary = compute_sentiment_summary(scored)

    for comment in scored:
        embedding = generate_embedding(comment["text"])
        await insert_comment(
            comment_id=comment["id"],
            job_id=job_id,
            text=comment["text"],
            author=comment["author"],
            upvotes=comment["upvotes"],
            sentiment_score=comment["compound"],
            embedding=embedding,
        )

    swot = synthesize_swot(summary, scored)
    blue_ocean = synthesize_blue_ocean(summary, scored)
    conclusion = generate_conclusion(summary, swot)
    report_id = str(uuid.uuid4())

    await insert_report(
        report_id=report_id,
        job_id=job_id,
        swot=swot,
        blue_ocean=blue_ocean,
        conclusion=conclusion,
    )

    await update_job_status(job_id, "Done")

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
        raise HTTPException(status_code=404, detail=f"No comments found for job {job_id}")
    return {"job_id": job_id, "count": len(comments), "comments": comments}


@app.get("/jobs/{job_id}/report")
async def get_job_report(job_id: str):
    report = await get_report_by_job(job_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"No report found for job {job_id}")
    return report
