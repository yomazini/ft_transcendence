import math
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

with patch("app.database.get_pool", new_callable=AsyncMock), patch(
    "app.worker.start_worker", new_callable=AsyncMock
), patch("app.worker.stop_worker", new_callable=AsyncMock), patch(
    "app.events.close_redis", new_callable=AsyncMock
), patch(
    "app.database.close_pool", new_callable=AsyncMock
):
    from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "analysis-svc"}


def test_sentiment_endpoint():
    payload = {
        "comments": [
            "I absolutely love this product!",
            "Terrible customer support, waited 3 days.",
            "The server runs on port 8001.",
        ]
    }
    response = client.post("/analyze/sentiment", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["comments"]) == 3
    assert data["comments"][0]["compound"] > 0.05
    assert data["comments"][0]["subjectivity_label"] == "opinion"
    assert data["comments"][1]["compound"] < -0.05
    assert data["comments"][2]["subjectivity"] < 0.35
    assert data["comments"][2]["subjectivity_label"] == "fact"
    assert "positive_ratio" in data["summary"]
    assert "avg_subjectivity" in data["summary"]
    assert "fact_count" in data["summary"]
    assert "opinion_count" in data["summary"]


def test_vader_and_textblob_scoring():
    from app.sentiment import compute_sentiment_summary, score_comments

    comments = [
        {"text": "This is amazing!", "author": "user1", "upvotes": 10},
        {"text": "The desktop app uses 450MB of RAM.", "author": "user2", "upvotes": 5},
    ]
    scored = score_comments(comments)
    assert scored[0]["compound"] > 0.05
    assert scored[0]["subjectivity_label"] == "opinion"
    assert scored[1]["subjectivity"] == 0.0
    assert scored[1]["subjectivity_label"] == "fact"

    summary = compute_sentiment_summary(scored)
    assert summary["positive_count"] == 1
    assert summary["fact_count"] == 1
    assert summary["opinion_count"] == 1


def test_embedding_dimensions():
    from app.embeddings import generate_embedding

    vec = generate_embedding("test text")
    assert len(vec) == 384
    assert all(isinstance(v, float) for v in vec)


def test_embedding_deterministic():
    from app.embeddings import generate_embedding

    vec1 = generate_embedding("same text here")
    vec2 = generate_embedding("same text here")
    assert vec1 == vec2


def test_embedding_normalized():
    from app.embeddings import generate_embedding

    vec = generate_embedding("normalize me")
    norm = math.sqrt(sum(v * v for v in vec))
    assert abs(norm - 1.0) < 0.001


def test_swot_synthesis():
    from app.synthesis import synthesize_swot

    summary = {
        "positive_count": 3,
        "negative_count": 2,
        "neutral_count": 1,
        "positive_ratio": 0.5,
        "negative_ratio": 0.33,
        "neutral_ratio": 0.17,
        "avg_compound": 0.15,
        "avg_subjectivity": 0.55,
        "fact_count": 2,
        "opinion_count": 4,
    }
    comments = [
        {
            "text": "Great product!",
            "compound": 0.8,
            "pos": 0.5,
            "neg": 0,
            "neu": 0.5,
            "subjectivity": 0.75,
            "subjectivity_label": "opinion",
        },
        {
            "text": "Terrible support.",
            "compound": -0.7,
            "pos": 0,
            "neg": 0.5,
            "neu": 0.5,
            "subjectivity": 1.0,
            "subjectivity_label": "opinion",
        },
    ]
    swot = synthesize_swot(summary, comments)
    assert "strengths" in swot
    assert "weaknesses" in swot
    assert "opportunities" in swot
    assert "threats" in swot
    assert "subjectivity_breakdown" in swot


def test_swot_synthesis_keeps_full_comment_text():
    from app.synthesis import synthesize_swot

    text = "word " * 50
    summary = {
        "negative_ratio": 0.0,
        "neutral_ratio": 0.0,
        "avg_subjectivity": 0.5,
        "fact_count": 0,
        "opinion_count": 1,
    }
    comments = [
        {
            "text": text,
            "compound": 0.8,
            "subjectivity_label": "opinion",
        },
    ]

    swot = synthesize_swot(summary, comments)

    assert text in swot["strengths"][0]
    assert "..." not in swot["strengths"][0]


def test_blue_ocean_synthesis():
    from app.synthesis import synthesize_blue_ocean

    summary = {
        "positive_ratio": 0.5,
        "negative_ratio": 0.3,
        "neutral_ratio": 0.2,
        "avg_compound": 0.1,
    }
    comments = [
        {
            "text": "The pricing is too high",
            "compound": -0.5,
            "pos": 0,
            "neg": 0.5,
            "neu": 0.5,
        },
    ]
    result = synthesize_blue_ocean(summary, comments)
    assert "factors" in result
    assert "strategy" in result
    assert "price" in result["factors"]


def test_fixture_comments():
    from tests.fixtures import get_fixture_comments

    comments = get_fixture_comments()
    assert len(comments) == 10
    assert all("id" in c and "text" in c and "author" in c for c in comments)


def test_publish_job_event():
    import asyncio

    from app.events import publish_job_event

    mock_redis = AsyncMock()
    with patch("app.events.get_redis", return_value=mock_redis):
        asyncio.run(publish_job_event("job-1", "done", {"report_id": "rep-1"}))
        mock_redis.publish.assert_called_once()
        channel, message = mock_redis.publish.call_args[0]
        assert channel == "job-events"
        assert '"status": "done"' in message
        assert '"report_id": "rep-1"' in message


def test_rank_top_comments():
    from app.ranking import rank_top_comments
    from app.sentiment import score_comments
    from tests.fixtures import get_fixture_comments

    scored = score_comments(get_fixture_comments())
    ranked = rank_top_comments(scored, top_k=5)
    assert len(ranked["top_overall"]) == 5
    scores = [c["impact_score"] for c in ranked["top_overall"]]
    assert scores == sorted(scores, reverse=True)
    assert "top_positive" in ranked
    assert "top_negative" in ranked


def test_build_synthesis_prompt():
    from app.canvas import build_synthesis_prompt
    from app.sentiment import score_comments
    from tests.fixtures import get_fixture_comments

    scored = score_comments(get_fixture_comments())
    job = {
        "id": "job-123",
        "target": "r/freelance",
        "mode": "Subreddit",
        "customer_persona": {
            "description": "indie hackers",
            "price_sensitivity": "high",
        },
    }
    prompt = build_synthesis_prompt(job, scored)
    assert "<customer_persona>" in prompt
    assert "indie hackers" in prompt
    assert '<comment id="c1"' in prompt
    assert "# SWOT Synthesis" in prompt
    assert "# Blue Ocean Strategy Synthesis" in prompt
    assert "# Feature Suggestions" in prompt


def test_build_rag_prompt():
    from app.canvas import build_rag_prompt

    comments = [
        {"id": "uuid-1", "similarity": 0.88, "upvotes": 42, "text": "Too expensive."}
    ]
    prompt = build_rag_prompt("What is the price?", comments)
    assert "<question>What is the price?</question>" in prompt
    assert '<retrieved_comment id="c1"' in prompt
    assert 'relevance_score="0.88"' in prompt

    with_persona = build_rag_prompt(
        "What is the price?",
        comments,
        {"customer_persona": {"description": "freelance designers"}},
    )
    assert "<customer_persona>" in with_persona
    assert "freelance designers" in with_persona


def test_extract_json_object():
    from app.llm import extract_json_object

    fence = "`" * 3
    raw = f'<think>reasoning</think>\n{fence}json\n{{"swot": {{"strengths": []}}}}\n{fence}'
    parsed = extract_json_object(raw)
    assert "swot" in parsed


def test_synthesize_full_report_with_mocked_llm():
    import asyncio

    from app.sentiment import compute_sentiment_summary, score_comments
    from app.synthesis import synthesize_full_report
    from tests.fixtures import get_fixture_comments

    scored = score_comments(get_fixture_comments())
    summary = compute_sentiment_summary(scored)
    fake_llm_json = {
        "swot": {
            "persona_used": "indie hackers",
            "strengths": [{"point": "Clean UI", "cited_comment_ids": ["c1"]}],
            "weaknesses": [{"point": "High pricing", "cited_comment_ids": ["c2"]}],
            "opportunities": [],
            "threats": [],
            "notes": "No injection detected",
        },
        "blue_ocean": {
            "eliminate": [],
            "reduce": [],
            "raise": [],
            "create": [
                {
                    "action": "Solo tier",
                    "from_weakness_or_opportunity": "High pricing",
                    "why_this_is_the_strongest_candidate": "Underserved segment",
                }
            ],
        },
        "features": [
            {
                "name": "Solo $9 Plan",
                "justification": "Matches budget priority",
                "cited_comment_ids": ["c2"],
                "priority": "high",
            }
        ],
        "weakest_suggestion": "Custom enterprise themes",
    }

    with patch(
        "app.synthesis.call_openrouter_json",
        new_callable=AsyncMock,
        return_value=fake_llm_json,
    ):
        report = asyncio.run(
            synthesize_full_report(
                {"customer_persona": {"description": "indie hackers"}},
                summary,
                scored,
            )
        )
        assert report["swot"]["persona_used"] == "indie hackers"
        assert "subjectivity_breakdown" in report["swot"]
        assert report["blue_ocean"]["features"][0]["name"] == "Solo $9 Plan"
        assert "Solo $9 Plan" in report["conclusion"]


def test_synthesize_full_report_fails_when_llm_returns_nothing():
    import asyncio

    from app.sentiment import compute_sentiment_summary, score_comments
    from app.synthesis import synthesize_full_report
    from tests.fixtures import get_fixture_comments

    scored = score_comments(get_fixture_comments())
    summary = compute_sentiment_summary(scored)

    with patch(
        "app.synthesis.call_openrouter_json",
        new_callable=AsyncMock,
        return_value=None,
    ), pytest.raises(RuntimeError, match="LLM synthesis failed"):
        asyncio.run(synthesize_full_report(None, summary, scored))


def test_synthesize_full_report_refuses_one_comment():
    import asyncio

    from app.sentiment import compute_sentiment_summary, score_comments
    from app.synthesis import synthesize_full_report
    from tests.fixtures import get_fixture_comments

    scored = score_comments(get_fixture_comments()[:1])
    summary = compute_sentiment_summary(scored)

    report = asyncio.run(synthesize_full_report(None, summary, scored))

    assert "Not enough information" in report["conclusion"]
    assert report["swot"]["strengths"] == []
    assert report["blue_ocean"]["features"] == []


def test_rerank_for_rag():
    from app.ranking import rerank_for_rag

    comments = [
        {"id": "c1", "similarity": 0.90, "upvotes": 0},
        {"id": "c2", "similarity": 0.85, "upvotes": 100},
        {"id": "c3", "similarity": 0.40, "upvotes": 5},
    ]
    reranked = rerank_for_rag(comments, top_k=2)
    assert len(reranked) == 2
    assert reranked[0]["id"] == "c2"
    assert reranked[0]["final_score"] > reranked[1]["final_score"]


def test_rag_query_endpoint_success():
    fake_comments = [
        {
            "id": "c-1",
            "job_id": "job-123",
            "text": "the monthly price is high",
            "author": "dev1",
            "upvotes": 45,
            "sentiment_score": -0.5,
            "similarity": 0.88,
            "created_at": "2026-10-10t12:00:00z",
        }
    ]
    with patch(
        "app.main.get_job", new_callable=AsyncMock, return_value={"id": "job-123"}
    ), patch(
        "app.main.search_comments_by_vector",
        new_callable=AsyncMock,
        return_value=fake_comments,
    ), patch(
        "app.main.call_openrouter_text",
        new_callable=AsyncMock,
        return_value="pricing is considered expensive by users.\n\nsources: c1",
    ):
        response = client.post(
            "/rag/query",
            json={"job_id": "job-123", "query": "how is the pricing?"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "pricing is considered expensive" in data["answer"]
        assert len(data["citations"]) == 1
        assert data["citations"][0]["author"] == "dev1"


def test_rag_query_returns_502_when_llm_fails():
    fake_comments = [
        {
            "id": "c-1",
            "job_id": "job-123",
            "text": "the monthly price is high",
            "author": "dev1",
            "upvotes": 45,
            "sentiment_score": -0.5,
            "similarity": 0.88,
            "created_at": "2026-10-10t12:00:00z",
        }
    ]
    with patch(
        "app.main.get_job", new_callable=AsyncMock, return_value={"id": "job-123"}
    ), patch(
        "app.main.search_comments_by_vector",
        new_callable=AsyncMock,
        return_value=fake_comments,
    ), patch(
        "app.main.call_openrouter_text",
        new_callable=AsyncMock,
        return_value=None,
    ):
        response = client.post(
            "/rag/query",
            json={"job_id": "job-123", "query": "how is the pricing?"},
        )
        assert response.status_code == 502


def test_rag_query_returns_503_when_embedding_model_fails():
    with patch(
        "app.main.get_job", new_callable=AsyncMock, return_value={"id": "job-123"}
    ), patch(
        "app.main.generate_embedding",
        side_effect=RuntimeError("model down"),
    ):
        response = client.post(
            "/rag/query",
            json={"job_id": "job-123", "query": "how is the pricing?"},
        )
        assert response.status_code == 503
        assert response.json()["detail"] == "Embedding model unavailable"


def test_rag_query_endpoint_job_not_found():
    with patch("app.main.get_job", new_callable=AsyncMock, return_value=None):
        response = client.post(
            "/rag/query",
            json={"job_id": "unknown-job", "query": "any query?"},
        )
        assert response.status_code == 404
