Run this single command in a terminal to trace every request through the entire stack in real time as you click or submit a job:

```bash
docker compose logs -f --tail=0 nginx gateway-svc scraper-svc analysis-svc auth-svc
```

---

### The One-Line Mental Lifecycle to Trace It in Your Head

> **Browser** (Next.js) $\xrightarrow{\text{port 80}}$ **nginx** (WAF + `/auth/verify`) $\to$ **gateway-svc** (`POST /jobs` + JWT check) $\to$ **Redis BullMQ** (`scrape-job`) $\to$ **scraper-svc** (Reddit JSON $\to$ `analyze-job`) $\to$ **analysis-svc** (VADER + MiniLM 384d vector + pgvector + OpenRouter LLM) $\to$ **Redis Pub/Sub** (`job-events`) $\to$ **gateway-svc** (Socket.IO) $\to$ **Browser Live Badge** (`job:done`).

---

Follow this **exact file-by-file breadcrumb path** through the code:

```
frontend/app/(dashboard)/[uuid-user]/home/NewJobCard.tsx
  └─► nginx/nginx.conf
        └─► gateway-svc/src/jobs/jobs.controller.ts
              └─► gateway-svc/src/jobs/jobs.service.ts
                    └─► scraper-svc/src/scraper_svc/ScrapingWorker.py
                          └─► analysis-svc/app/worker.py
                                └─► analysis-svc/app/events.py
                                      └─► gateway-svc/src/events/events.gateway.ts
                                            └─► frontend/hooks/useJobEvents.ts
```

---

### What each step does in the code

1. `NewJobCard.tsx` — `fetch('/api/jobs')` sends the form data from the browser.
2. `nginx.conf` — WAF validates headers, forwards `/api/jobs` to `:3001`.
3. `jobs.controller.ts` — `JwtAuthGuard` checks token, passes to service.
4. `jobs.service.ts` — inserts `Job` in Postgres, does `queue.add('scrape-job')`.
5. `ScrapingWorker.py` — dequeues `scrape-job`, scrapes Reddit, pushes comments to `analyze-job`.
6. `worker.py` — dequeues `analyze-job`, runs VADER + pgvector embeddings + LLM synthesis, saves `Report`.
7. `events.py` — publishes `{job_id, status: "done"}` to Redis channel `job-events`.
8. `events.gateway.ts` — receives Redis message, re-emits `server.emit('job:done')` over Socket.IO.
9. `useJobEvents.ts` — React hook receives the socket event, updates the UI badge to `done`.
