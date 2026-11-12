import json
import logging

import redis.asyncio as aioredis

from .config import settings

logger = logging.getLogger("analysis-events")

_redis: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            decode_responses=True,
        )
    return _redis


async def close_redis():
    global _redis
    if _redis is not None:
        await _redis.aclose()

        _redis = None


async def publish_job_event(
    job_id: str,
    status: str,
    extra: dict | None = None,
):
    payload = {"job_id": job_id, "status": status}
    if extra:
        payload.update(extra)
    try:
        client = await get_redis()
        await client.publish(settings.events_channel, json.dumps(payload))
        logger.info("Published %s for job %s", status, job_id)
    except Exception as e:  # noqa: BLE001 - publishing must not fail the job
        logger.warning("Failed to publish job event %s: %s", status, e)
