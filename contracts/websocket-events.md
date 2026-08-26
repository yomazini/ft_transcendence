# WebSocket Events Specification — ft_transcendence

This document defines the exact WebSocket event protocol emitted by `gateway-svc` and consumed by `frontend`.

## Transport & Connection
- **Gateway Endpoint:** `ws://localhost:3001/ws`
- **Authentication:** Token passed via query param or handshake header:
  `ws://localhost:3001/ws?token=<JWT_TOKEN>`
- **Room Scoping:** Clients join their organization room on connection: `org:<org_id>` to ensure tenant isolation.

---

## 1. Job Lifecycle Events

### Event: `job:queued`
Emitted immediately when `POST /api/jobs` succeeds and the job is pushed into the Redis queue.
```json
{
  "event": "job:queued",
  "data": {
    "job_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "org_id": "7ca24e12-8812-4211-9a1c-1f482d88efa1",
    "mode": "subreddit",
    "target": "r/freelance",
    "status": "queued",
    "created_at": "2026-08-24T15:30:00Z"
  }
}
```

### Event: `job:running`
Emitted by `scraper-svc` when it picks up the job and begins fetching Reddit comment trees.
```json
{
  "event": "job:running",
  "data": {
    "job_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "org_id": "7ca24e12-8812-4211-9a1c-1f482d88efa1",
    "status": "running",
    "progress_percent": 15,
    "message": "Scraping Reddit comments..."
  }
}
```

### Event: `job:done`
Emitted by `analysis-svc` via Redis Pub/Sub after SWOT, Blue Ocean synthesis, and pgvector embeddings are stored.
```json
{
  "event": "job:done",
  "data": {
    "job_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "org_id": "7ca24e12-8812-4211-9a1c-1f482d88efa1",
    "status": "done",
    "report_id": "9bb21f33-1123-4122-8a1a-3e582d99bfa2",
    "completed_at": "2026-08-24T15:31:12Z"
  }
}
```

### Event: `job:failed`
Emitted if either scraping or AI synthesis encounters an unrecoverable error.
```json
{
  "event": "job:failed",
  "data": {
    "job_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "org_id": "7ca24e12-8812-4211-9a1c-1f482d88efa1",
    "status": "failed",
    "error": "Rate limit exceeded on Reddit API. Backoff exhausted."
  }
}
```
