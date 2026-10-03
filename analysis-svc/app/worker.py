import logging
import uuid

from bullmq import Worker

from .config import settings
from .database import update_job_status, insert_comment, insert_report
from .fixtures import get_fixture_comments
from .sentiment import score_comments, compute_sentiment_summary
from .embeddings import generate_embedding
from .synthesis import synthesize_swot, synthesize_blue_ocean, generate_conclusion

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
        logger.info("Job %s completed", job_id)

        return {
            "job_id": job_id,
            "comments_processed": len(scored),
            "report_id": report_id,
            "sentiment_summary": summary,
        }

    except Exception as e:
        logger.exception("Job %s failed: %s", job_id, e)
        try:
            await update_job_status(job_id, "Failed")
        except Exception:
            logger.exception("Could not update job status to Failed")
        raise


async def start_worker():
    global _worker
    if _worker is not None:
        return

    _worker = Worker(
        "scrape-job",
        process_job,
        {
            "connection": f"redis://{settings.redis_host}:{settings.redis_port}",
        },
    )
    logger.info("BullMQ worker started on queue scrape-job")


async def stop_worker():
    global _worker
    if _worker:
        await _worker.close()
        _worker = None
