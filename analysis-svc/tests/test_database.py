import asyncio
from unittest.mock import AsyncMock, patch

from app.database import insert_comment


def test_insert_comment_sets_reddit_id_and_hash():
    pool = AsyncMock()

    with patch("app.database.get_pool", new=AsyncMock(return_value=pool)):
        asyncio.run(
            insert_comment(
                comment_id="comment-1",
                job_id="job-1",
                text="hello",
                author="user",
                upvotes=2,
                sentiment_score=0.5,
                embedding=[0.1, 0.2],
            )
        )

    sql, *args = pool.execute.call_args.args
    assert "reddit_id" in sql
    assert "hash" in sql
    assert args[3] == "comment-1"
    assert len(args[4]) == 64
