import json

import asyncpg

from .config import settings

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            user=settings.postgres_user,
            password=settings.postgres_password,
            database=settings.postgres_db,
            host=settings.postgres_host,
            port=settings.postgres_port,
            min_size=2,
            max_size=5,
        )
    return _pool


async def close_pool():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


async def update_job_status(job_id: str, status: str):
    pool = await get_pool()
    await pool.execute(
        'UPDATE "Job" SET status = $1 WHERE id = $2',
        status,
        job_id,
    )


async def insert_comment(
    comment_id: str,
    job_id: str,
    text: str,
    author: str,
    upvotes: int,
    sentiment_score: float,
    embedding: list[float],
):
    pool = await get_pool()
    embedding_str = "[" + ",".join(str(v) for v in embedding) + "]"
    await pool.execute(
        """
        INSERT INTO "Comments" (id, job_id, text, author, upvotes, sentiment_score, embedding)
        VALUES ($1, $2, $3, $4, $5, $6, $7::vector)
        ON CONFLICT (id) DO NOTHING
        """,
        comment_id,
        job_id,
        text,
        author,
        upvotes,
        sentiment_score,
        embedding_str,
    )


async def update_comment_analysis(
    comment_id: str,
    sentiment_score: float,
    embedding: list[float],
):
    pool = await get_pool()
    embedding_str = "[" + ",".join(str(v) for v in embedding) + "]"
    await pool.execute(
        """
        UPDATE "Comments"
        SET sentiment_score = $1, embedding = $2::vector
        WHERE id = $3
        """,
        sentiment_score,
        embedding_str,
        comment_id,
    )


async def insert_report(
    report_id: str,
    job_id: str,
    swot: dict,
    blue_ocean: dict,
    conclusion: str,
):
    pool = await get_pool()
    await pool.execute(
        """
        INSERT INTO "Report" (id, job_id, swot, blue_ocean, conclusion)
        VALUES ($1, $2, $3::jsonb, $4::jsonb, $5)
        ON CONFLICT (job_id) DO UPDATE
        SET swot = EXCLUDED.swot, blue_ocean = EXCLUDED.blue_ocean,
            conclusion = EXCLUDED.conclusion
        """,
        report_id,
        job_id,
        json.dumps(swot),
        json.dumps(blue_ocean),
        conclusion,
    )


async def get_job(job_id: str) -> dict | None:
    pool = await get_pool()
    row = await pool.fetchrow('SELECT * FROM "Job" WHERE id = $1', job_id)
    return dict(row) if row else None


async def get_comments_by_job(job_id: str) -> list[dict]:
    pool = await get_pool()
    rows = await pool.fetch(
        'SELECT id, text, author, upvotes, sentiment_score FROM "Comments" WHERE job_id = $1',
        job_id,
    )
    return [dict(r) for r in rows]


async def get_report_by_job(job_id: str) -> dict | None:
    pool = await get_pool()
    row = await pool.fetchrow('SELECT * FROM "Report" WHERE job_id = $1', job_id)
    return dict(row) if row else None


async def search_comments_by_vector(
    job_id: str,
    query_embedding: list[float],
    limit: int = 20,
) -> list[dict]:
    pool = await get_pool()
    embedding_str = "[" + ",".join(str(v) for v in query_embedding) + "]"
    query = """
        SELECT id, job_id, text, author, upvotes, sentiment_score, created_at,
               1 - (embedding <=> $1::vector) AS similarity
        FROM "Comments"
        WHERE job_id = $2 AND embedding IS NOT NULL
        ORDER BY embedding <=> $1::vector ASC
        LIMIT $3
    """
    rows = await pool.fetch(query, embedding_str, job_id, limit)
    return [dict(r) for r in rows]
