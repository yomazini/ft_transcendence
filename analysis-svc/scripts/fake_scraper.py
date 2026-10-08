import asyncio
import json
import sys
import uuid

import asyncpg
from bullmq import Queue

from app.config import settings
from app.fixtures import FIXTURE_COMMENTS

SEED_ORG_ID = "018f2d90-3b41-7e2a-9f12-111122223333"
SEED_USER_ID = "01111111-1111-7111-8111-111111111111"


async def push_fake_job(target: str = "r/saas"):
    job_id = str(uuid.uuid4())
    persona = {
        "description": "self-hosted developers",
        "price_sensitivity": "budget",
        "top_priority": "privacy",
    }
    conn = await asyncpg.connect(
        user=settings.postgres_user,
        password=settings.postgres_password,
        database=settings.postgres_db,
        host=settings.postgres_host,
        port=settings.postgres_port,
    )
    try:
        await conn.execute(
            """
            INSERT INTO "Job" (id, org_id, created_by, target, mode, status, customer_persona)
            VALUES ($1, $2, $3, $4, 'Subreddit', 'Queued', $5::jsonb)
            """,
            job_id,
            SEED_ORG_ID,
            SEED_USER_ID,
            target,
            json.dumps(persona),
        )
    finally:
        await conn.close()

    queue = Queue(
        settings.queue_name,
        {"connection": f"redis://{settings.redis_host}:{settings.redis_port}"},
    )
    try:
        await queue.add(
            "scrape",
            {
                "id": job_id,
                "target": target,
                "mode": "subreddit",
                "org_id": SEED_ORG_ID,
                "created_by": SEED_USER_ID,
                "comments": FIXTURE_COMMENTS,
            },
        )
        print(f"Enqueued fake job {job_id} for target {target}")
    finally:
        await queue.close()


if __name__ == "__main__":
    target_arg = sys.argv[1] if len(sys.argv) > 1 else "r/saas"
    asyncio.run(push_fake_job(target_arg))
