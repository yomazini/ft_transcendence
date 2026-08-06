# analysis-svc — FastAPI. Sentiment (VADER), embeddings (sentence-transformers),
# top-10 ranking, SWOT/Blue-Ocean synthesis (Gemini), RAG follow-up endpoint
# (pgvector similarity search).
# Depends on: fastapi, uvicorn, vaderSentiment, sentence-transformers,
# google-generativeai, pgvector, asyncpg, pydantic.
from fastapi import FastAPI

app = FastAPI(title="analysis-svc")


@app.get("/health")
async def health():
    return {"status": "ok"}
