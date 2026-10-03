import math
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

with patch("app.database.get_pool", new_callable=AsyncMock), \
     patch("app.worker.start_worker", new_callable=AsyncMock), \
     patch("app.worker.stop_worker", new_callable=AsyncMock), \
     patch("app.database.close_pool", new_callable=AsyncMock):
    from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "analysis-svc"}


def test_analyze_stub_endpoint():
    payload = {
        "job_id": "test-job-999",
        "comments": [
            "Great tool, but pricing is too high.",
            "Loved the customer support team.",
        ],
    }
    response = client.post("/analyze/test", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["job_id"] == "test-job-999"
    assert data["processed_comments_count"] == 2
    assert "sentiment_summary" in data
    assert data["status"] == "ready_for_synthesis"


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
    from app.sentiment import score_comments, compute_sentiment_summary

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
        "positive_count": 3, "negative_count": 2, "neutral_count": 1,
        "positive_ratio": 0.5, "negative_ratio": 0.33, "neutral_ratio": 0.17,
        "avg_compound": 0.15, "avg_subjectivity": 0.55,
        "fact_count": 2, "opinion_count": 4,
    }
    comments = [
        {"text": "Great product!", "compound": 0.8, "pos": 0.5, "neg": 0, "neu": 0.5, "subjectivity": 0.75, "subjectivity_label": "opinion"},
        {"text": "Terrible support.", "compound": -0.7, "pos": 0, "neg": 0.5, "neu": 0.5, "subjectivity": 1.0, "subjectivity_label": "opinion"},
    ]
    swot = synthesize_swot(summary, comments)
    assert "strengths" in swot
    assert "weaknesses" in swot
    assert "opportunities" in swot
    assert "threats" in swot
    assert "subjectivity_breakdown" in swot


def test_blue_ocean_synthesis():
    from app.synthesis import synthesize_blue_ocean

    summary = {"positive_ratio": 0.5, "negative_ratio": 0.3, "neutral_ratio": 0.2, "avg_compound": 0.1}
    comments = [
        {"text": "The pricing is too high", "compound": -0.5, "pos": 0, "neg": 0.5, "neu": 0.5},
    ]
    result = synthesize_blue_ocean(summary, comments)
    assert "factors" in result
    assert "strategy" in result
    assert "price" in result["factors"]


def test_fixture_comments():
    from app.fixtures import get_fixture_comments

    comments = get_fixture_comments()
    assert len(comments) == 10
    assert all("id" in c and "text" in c and "author" in c for c in comments)
