from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.worker import process_job


def make_job(attempts_made: int) -> SimpleNamespace:
    return SimpleNamespace(
        data={
            "id": "job-1",
            "comments": [
                {"id": "c-1", "text": "hello", "author": "a", "upvotes": 1},
            ],
        },
        attemptsMade=attempts_made,
        opts={"attempts": 3},
    )


@pytest.mark.asyncio
async def test_intermediate_attempt_does_not_mark_failed():
    update_status = AsyncMock()
    publish = AsyncMock()
    insert = AsyncMock()

    with patch("app.worker.update_job_status", update_status), patch(
        "app.worker.publish_job_event", publish
    ), patch("app.worker.insert_comment", insert), patch(
        "app.worker.get_job", new_callable=AsyncMock, return_value={"id": "job-1"}
    ), patch(
        "app.worker.get_comments_by_job", new_callable=AsyncMock, return_value=[]
    ), patch(
        "app.worker.generate_embeddings",
        side_effect=RuntimeError("model down"),
    ), pytest.raises(RuntimeError, match="model down"):
        await process_job(make_job(attempts_made=0), None)

    update_status.assert_awaited_once_with("job-1", "Running")
    publish.assert_awaited_once_with("job-1", "running")
    insert.assert_not_awaited()


@pytest.mark.asyncio
async def test_final_attempt_marks_failed_once():
    update_status = AsyncMock()
    publish = AsyncMock()
    insert = AsyncMock()
    metrics = MagicMock()

    with patch("app.worker.update_job_status", update_status), patch(
        "app.worker.publish_job_event", publish
    ), patch("app.worker.insert_comment", insert), patch(
        "app.worker.analysis_jobs", metrics
    ), patch(
        "app.worker.get_job", new_callable=AsyncMock, return_value={"id": "job-1"}
    ), patch(
        "app.worker.get_comments_by_job", new_callable=AsyncMock, return_value=[]
    ), patch(
        "app.worker.generate_embeddings",
        side_effect=RuntimeError("model down"),
    ), pytest.raises(RuntimeError, match="model down"):
        await process_job(make_job(attempts_made=2), None)

    assert update_status.await_args_list == [
        (("job-1", "Running"),),
        (("job-1", "Failed"),),
    ]
    assert [call.args[1] for call in publish.await_args_list] == ["running", "failed"]
    metrics.labels.assert_called_once_with("failed")
    metrics.labels.return_value.inc.assert_called_once()
    insert.assert_not_awaited()


@pytest.mark.asyncio
async def test_success_batches_embeddings_before_writes():
    update_status = AsyncMock()
    publish = AsyncMock()
    insert = AsyncMock()
    generate = MagicMock(return_value=[[0.1] * 384, [0.2] * 384])

    with patch("app.worker.update_job_status", update_status), patch(
        "app.worker.publish_job_event", publish
    ), patch("app.worker.insert_comment", insert), patch(
        "app.worker.generate_embeddings", generate
    ), patch(
        "app.worker.insert_report", new_callable=AsyncMock
    ), patch(
        "app.worker.get_job",
        new_callable=AsyncMock,
        return_value={"id": "job-1", "target": "x", "mode": "Post"},
    ), patch(
        "app.worker.get_comments_by_job", new_callable=AsyncMock, return_value=[]
    ), patch(
        "app.worker.synthesize_full_report",
        new_callable=AsyncMock,
        return_value={
            "swot": {},
            "blue_ocean": {},
            "conclusion": "ok",
        },
    ):
        job = make_job(attempts_made=0)
        job.data["comments"] = [
            {"id": "c-1", "text": "hello", "author": "a", "upvotes": 1},
            {"id": "c-2", "text": "world", "author": "b", "upvotes": 2},
        ]
        result = await process_job(job, None)

    generate.assert_called_once_with(["hello", "world"])
    assert insert.await_count == 2
    assert result["comments_processed"] == 2
    assert [call.args[1] for call in publish.await_args_list] == ["running", "done"]
