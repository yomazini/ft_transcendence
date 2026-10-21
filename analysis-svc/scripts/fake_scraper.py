import asyncio
import json
import os
import sys
import uuid

import asyncpg
from bullmq import Queue

from app.config import settings
from app.fixtures import FIXTURE_COMMENTS


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
    org_id_env = os.getenv("SEED_ORG_ID")
    user_id_env = os.getenv("SEED_USER_ID")
    if org_id_env and user_id_env:
        seed_org_id = org_id_env
        seed_user_id = user_id_env
    else:
        org_row = await conn.fetchrow('SELECT id FROM "Organization" LIMIT 1')
        user_row = await conn.fetchrow('SELECT id FROM "User" LIMIT 1')
        if not org_row or not user_row:
            raise RuntimeError(
                "No Organization/User found. Create one first (e.g. via signup)."
            )
        seed_org_id = str(org_row["id"])
        seed_user_id = str(user_row["id"])
    try:
        await conn.execute(
            """
            INSERT INTO "Job" (id, org_id, created_by, target, mode, status, customer_persona)
            VALUES ($1, $2, $3, $4, 'Subreddit', 'Queued', $5::jsonb)
            """,
            job_id,
            seed_org_id,
            seed_user_id,
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
                "org_id": seed_org_id,
                "created_by": seed_user_id,
                "comments": FIXTURE_COMMENTS,
            },
        )
        print(f"Enqueued fake job {job_id} for target {target}")
    finally:
        await queue.close()


if __name__ == "__main__":
    target_arg = sys.argv[1] if len(sys.argv) > 1 else "r/saas"
    asyncio.run(push_fake_job(target_arg))
