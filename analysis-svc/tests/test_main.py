import pytest
from fastapi.testclient import TestClient
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
