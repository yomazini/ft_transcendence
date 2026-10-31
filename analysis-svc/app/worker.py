import asyncio
import logging
import time
import uuid
from typing import Any, cast

from bullmq import Worker

from .config import settings
from .database import (
    get_comments_by_job,
    get_job,
    insert_comment,
    insert_report,
    update_comment_analysis,
    update_job_status,
)
from .embeddings import generate_embedding
from .events import publish_job_event
from .metrics import analysis_jobs, analysis_stage_duration
from .sentiment import compute_sentiment_summary, score_comments
from .synthesis import synthesize_full_report

logger = logging.getLogger("analysis-worker")
logger.setLevel(logging.INFO)

_worker: Worker | None = None


async def process_job(job, token):
    job_id = job.data.get("id") if job.data else None
    if not job_id:
        logger.error("Job missing 'id' field in payload: %s", job.data)
        return {"error": "missing job id"}

    logger.info("Processing job %s", job_id)

    try:
        await update_job_status(job_id, "Running")
        await publish_job_event(job_id, "running")

        job_row = await get_job(job_id)
        if not job_row and job.data:
            job_row = dict(job.data)

        existing_db_comments = await get_comments_by_job(job_id)
        payload_comments = job.data.get("comments") if job.data else None

        if existing_db_comments:
            comments = existing_db_comments
            from_db = True
        elif payload_comments:
            comments = [
                {
                    "id": c.get("id") or str(uuid.uuid4()),
                    "text": c["text"],
                    "author": c.get("author", "reddit_user"),
                    "upvotes": int(c.get("upvotes", 0)),
                }
                for c in payload_comments
            ]
            from_db = False
        else:
            raise ValueError(f"Job {job_id} has no comments")

        started = time.perf_counter()
        scored = score_comments(comments)
        summary = compute_sentiment_summary(scored)
        analysis_stage_duration.labels("sentiment").observe(
            time.perf_counter() - started
        )

        for comment in scored:
            embedding = await asyncio.to_thread(generate_embedding, comment["text"])
            if from_db:
                await update_comment_analysis(
                    comment_id=comment["id"],
                    sentiment_score=comment["compound"],
                    embedding=embedding,
                )
            else:
                await insert_comment(
                    comment_id=comment["id"],
                    job_id=job_id,
                    text=comment["text"],
                    author=comment["author"],
                    upvotes=comment["upvotes"],
                    sentiment_score=comment["compound"],
                    embedding=embedding,
                )

        started = time.perf_counter()
        report_data = await synthesize_full_report(job_row, summary, scored)
        analysis_stage_duration.labels("synthesis").observe(
            time.perf_counter() - started
        )
        report_id = str(uuid.uuid4())

        await insert_report(
            report_id=report_id,
            job_id=job_id,
            swot=report_data["swot"],
            blue_ocean=report_data["blue_ocean"],
            conclusion=report_data["conclusion"],
        )

        await update_job_status(job_id, "Done")
        analysis_jobs.labels("done").inc()
        await publish_job_event(job_id, "done", {"report_id": report_id})
        logger.info("Job %s completed", job_id)

        return {
            "job_id": job_id,
            "comments_processed": len(scored),
            "report_id": report_id,
            "sentiment_summary": summary,
        }

    except Exception as e:
        logger.exception("Job %s failed: %s", job_id, e)
        analysis_jobs.labels("failed").inc()
        try:
            await update_job_status(job_id, "Failed")
            await publish_job_event(job_id, "failed", {"error": str(e)})
        except Exception:
            logger.exception("Could not update job status to Failed")
        raise


async def start_worker():
    global _worker
    if _worker is not None:
        return

    _worker = Worker(
        settings.queue_name,
        cast(Any, process_job),
        {
            "connection": f"redis://{settings.redis_host}:{settings.redis_port}",
        },
    )
    logger.info("BullMQ worker started on queue %s", settings.queue_name)


async def stop_worker():
    global _worker
    if _worker:
        await _worker.close()
        _worker = None
