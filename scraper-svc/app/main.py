# scraper-svc — FastAPI. Reddit ingestion via PRAW: 4 modes (keyword,
# subreddit, post, user), bulk CSV target upload. Pushes scraped comments
# to the analyze queue.
# Depends on: fastapi, uvicorn, asyncpraw, pydantic, redis (BullMQ producer).
from fastapi import FastAPI

app = FastAPI(title="scraper-svc")

@app.get("/health")
async def health():
    return {"status": "ok"}
