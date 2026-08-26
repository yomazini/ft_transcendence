# analysis-svc — FastAPI Computational Service
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="analysis-svc", version="0.1.0")


class HealthResponse(BaseModel):
    status: str
    service: str


class AnalyzeStubRequest(BaseModel):
    job_id: str
    comments: List[str]


@app.get("/health", response_model=HealthResponse)
async def health():
    return {"status": "ok", "service": "analysis-svc"}


@app.post("/analyze/test")
async def analyze_test_stub(payload: AnalyzeStubRequest):
    """
    Week 1 Stub: Validates input format and returns canned VADER + SWOT structure
    before full pipeline wiring in W2-W5.
    """
    return {
        "job_id": payload.job_id,
        "processed_comments_count": len(payload.comments),
        "sentiment_summary": {
            "positive_ratio": 0.65,
            "neutral_ratio": 0.20,
            "negative_ratio": 0.15,
        },
        "status": "ready_for_synthesis",
        "timestamp": datetime.utcnow().isoformat(),
    }
