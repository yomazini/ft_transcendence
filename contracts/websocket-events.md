# WebSocket Event Contract

## Connection & Authentication

Clients establish a persistent connection to the Gateway Service via Socket.io.
Authentication tokens MUST be passed in the handshake `auth` payload (not query parameters) to prevent token leakage in server access logs.

### Client Handshake
```typescript
import { io } from "socket.io-client";

const socket = io("wss://api.ft-transcendence.local", {
  path: "/socket.io",
  transports: ["websocket"],
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // JWT Bearer Token
  }
});
```

---

## Server -> Client Events

### 1. `job:queued`
Emitted immediately when a job request is validated and enqueued into Redis BullMQ.

```json
{
  "event": "job:queued",
  "job_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "org_id": "7ca24e12-8812-4211-9a1c-1f482d88efa1",
  "target": "r/freelance",
  "queue_position": 1,
  "timestamp": "2026-08-24T12:00:00.000Z"
}
```

### 2. `job:running`
Emitted when `scraper-svc` begins fetching Reddit posts or `analysis-svc` begins VADER/Gemini processing.

```json
{
  "event": "job:running",
  "job_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "stage": "scraping",
  "progress_percentage": 25,
  "comments_collected": 150,
  "timestamp": "2026-08-24T12:01:30.000Z"
}
```

### 3. `job:done`
Emitted upon full report synthesis and database persistence.

```json
{
  "event": "job:done",
  "job_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "report_id": "8db34f12-4412-4211-9a1c-2f482d99efa2",
  "total_comments_analyzed": 420,
  "timestamp": "2026-08-24T12:04:15.000Z"
}
```

### 4. `job:failed`
Emitted if scraping fails (e.g. rate limit / private subreddit) or Gemini API errors.

```json
{
  "event": "job:failed",
  "job_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "error_code": "REDDIT_SUBREDDIT_NOT_FOUND",
  "message": "Subreddit does not exist or is private",
  "retryable": false,
  "timestamp": "2026-08-24T12:01:05.000Z"
}
```
