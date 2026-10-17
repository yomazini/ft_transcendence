# What entered `dev` on 2026-10-14 — per person, and how to learn it

``
Today two pull requests brought **281 files** into `dev`:

| PR                            | What it brought                                                                                                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#45** `feature/frontend`    | Hamza's and Oussama's frontend, Mehdi's auth pages, Youssef's chat (ported)                                                                                                         |
| **#46** `feature/integration` | the merges of `feature/scraper-svc`, `feature/auth-svc`, `feature/analysis-svc`, `feature/gateway-svc`, `feature/vault`, then 11 fix commits that made the whole stack run together |

Each person's section has:

- **A. What their branch brought into `dev`** — every file, what it is for.
- **B. What was changed so it works in `dev`** — the integration fixes on their files.
- **How it works** — the flow in plain words.
- **Concepts to read** — official pages (every link opened on 2026-10-14).
- **Practices** — rules of thumb to reuse.
- **Exercises** — hands-on in the running stack, each with a **Check**.

### Commands to explore by yourself

```bash
git diff cd1f205 origin/dev -- <file>          # the whole change of one file today
git diff 81f7929 origin/dev -- <file>          # only the integration fixes (section B)
git log --oneline cd1f205..origin/dev -- <dir> # who changed a folder, and why
```

`cd1f205` is `dev` before today. `81f7929` is the last branch merge, before the 11 fixes.

The stack must be running (`docker compose up -d`). Test login: `stack-test@example.com` / `password123`.

```bash
TOKEN=$(curl -s -X POST http://localhost/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"stack-test@example.com","password":"password123"}' | sed -nE 's/.*"access_token":"([^"]+)".*/\1/p')
```

---

## 1. Youssef — gateway-svc, analysis-svc, contracts, chat

### A. What his branches brought into `dev`

**analysis-svc** (`feature/analysis-svc`, 23 files)

| File                                      | Status  | What it is for                                                                                                             |
| ----------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| `app/main.py`                             | changed | FastAPI app: health, analysis test endpoints, `POST /rag/query` (semantic question about a job)                            |
| `app/worker.py`                           | new     | BullMQ worker: takes a job, scores each comment, makes embeddings, writes comments and the report, publishes status events |
| `app/sentiment.py`                        | new     | VADER polarity (compound score −1…+1) + TextBlob subjectivity, and the summary of a job                                    |
| `app/embeddings.py`                       | new     | sentence-transformers `all-MiniLM-L6-v2`: one 384-number normalized vector per comment (mock fallback)                     |
| `app/database.py`                         | new     | asyncpg pool; reads/writes `Job`, `Comments`, `Report`; pgvector cosine search for RAG                                     |
| `app/ranking.py`                          | new     | "impact" ranking of top comments; hybrid cosine + upvote reranking for RAG                                                 |
| `app/canvas.py`                           | new     | builds the "Context Canvas" (top comments + context) given to the AI                                                       |
| `app/synthesis.py`                        | new     | SWOT + Blue Ocean report from the AI, with a deterministic fallback when the AI fails                                      |
| `app/llm.py`                              | new     | async OpenRouter client, tries a list of models in order                                                                   |
| `app/events.py`                           | new     | publishes `{job_id, status}` on the Redis channel `job-events`                                                             |
| `app/config.py`                           | new     | settings from environment variables (Postgres, Redis, queue, model, key)                                                   |
| `app/fixtures.py`                         | new     | sample comments used when a job arrives with none                                                                          |
| `app/__init__.py`                         | new     | package marker                                                                                                             |
| `skills/skills-*.md` (5)                  | new     | the prompt templates: SWOT, Blue Ocean, feature suggestions, orchestration, RAG follow-up                                  |
| `scripts/fake_scraper.py`                 | new     | pushes a test job into the queue without the real scraper                                                                  |
| `tests/test_main.py`                      | changed | unit tests (endpoints, AI JSON extraction, ranking, RAG)                                                                   |
| `Dockerfile`, `pyproject.toml`, `uv.lock` | changed | CPU-only torch, bullmq, textblob, and locked versions                                                                      |

**gateway-svc** (`feature/gateway-svc`, 21 files)

| File                                                                | Status        | What it is for                                                                                    |
| ------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| `src/jobs/jobs.controller.ts`                                       | new           | public API under `/api`: health, `POST /jobs` (rate-limited), `GET /jobs/:id`, `GET /reports/:id` |
| `src/jobs/jobs.service.ts`                                          | new           | saves a job in Postgres, pushes it to the BullMQ queue `scrape-job`, broadcasts `queued`          |
| `src/jobs/dto/create-job.dto.ts`                                    | new           | validation of `mode`, `target`, `customer_persona`                                                |
| `src/jobs/jobs.module.ts`                                           | new           | wires controller + service + database + events                                                    |
| `src/jobs/jobs.controller.spec.ts`                                  | new           | unit tests                                                                                        |
| `src/auth/jwt-auth.guard.ts`                                        | new           | reads the Bearer token and puts the user on the request                                           |
| `src/auth/public.decorator.ts`                                      | new           | `@Public()` marks routes that skip the guard (health)                                             |
| `src/database/database.service.ts`, `database.module.ts`            | new           | `pg` pool; `Job` / `Report` queries; in-memory fallback if Postgres is down                       |
| `src/events/events.gateway.ts`, `events.module.ts`                  | new           | Socket.IO server; subscribes to Redis `job-events` and re-emits `job:<status>` to browsers        |
| `src/app.module.ts`, `src/main.ts`                                  | changed       | modules, Swagger docs, validation pipe, CORS, throttling                                          |
| `src/app.controller.ts`, `app.service.ts`, `app.controller.spec.ts` | deleted       | NestJS starter files                                                                              |
| `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc`   | changed / new | bullmq, ioredis, socket.io, swagger, throttler                                                    |

**contracts** (15 files) and root

| File                                                   | Status  | What it is for                                                                                 |
| ------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------- |
| `contracts/bruno/01…13-*.bru` (13)                     | new     | Bruno requests to test gateway and analysis (health, jobs, reports, WebSocket, sentiment, RAG) |
| `contracts/bruno/bruno.json`, `environments/Local.bru` | new     | the Bruno collection and its local URLs                                                        |
| `.gitignore`                                           | changed | Python and pnpm artifacts                                                                      |

**Chat, in the frontend** (ported from `feature/message-frontend` in PR #45)

| File                                              | Status | What it is for                                                                               |
| ------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| `components/message/*` (8)                        | new    | chat UI: header, input with suggestions, message bubbles, citations, floating widget         |
| `hooks/useAutoScroll.ts`, `hooks/useJobEvents.ts` | new    | scroll to the last message; live job status over Socket.IO                                   |
| `types/chat.ts`, `app/api/rag/query/route.ts`     | new    | chat types; a Next.js route for RAG (not reached behind nginx, see issue 5 in `teamtodo.md`) |

### B. What was changed so it works in `dev`

| File                                           | New? | What changed                                                                                 |
| ---------------------------------------------- | ---- | -------------------------------------------------------------------------------------------- |
| `gateway-svc/src/auth/jwt-auth.guard.ts`       |      | checks the token's signature with `JWT_SECRET`; refuses purpose tokens; no more default user |
| `gateway-svc/src/jobs/jobs.service.ts`         |      | only your org's jobs and reports; job list; RAG forwarding to analysis                       |
| `gateway-svc/src/jobs/jobs.controller.ts`      |      | new routes `GET /api/jobs` and `POST /api/rag/query`                                         |
| `gateway-svc/src/jobs/dto/rag-query.dto.ts`    | new  | validation of the chat question                                                              |
| `gateway-svc/src/database/database.service.ts` |      | list an org's jobs; update a job's status                                                    |
| `gateway-svc/src/events/events.gateway.ts`     |      | marks a job `Failed` when the scraper reports it; WebSocket CORS limited to the frontend     |
| `gateway-svc/src/events/events.module.ts`      |      | gives the events code access to the database                                                 |
| `gateway-svc/src/main.ts`                      |      | HTTP CORS limited to `FRONTEND_URL`                                                          |
| `analysis-svc/app/llm.py`                      |      | dead free AI models replaced with ones that work                                             |
| `docker-compose.yml`                           |      | analysis reads the queue `analyze-job` (`QUEUE_NAME`)                                        |

### How it works

The browser sends `POST /api/jobs` → the gateway checks the token, saves the job (`Queued`),
puts it in `scrape-job` and tells the browser `queued` over the WebSocket. The scraper turns it
into comments and puts them in `analyze-job`. analysis-svc scores each comment (VADER),
makes its 384-number vector, saves them, asks the AI for SWOT + Blue Ocean (or builds a fallback
report), saves the report and publishes `done` on Redis; the gateway relays it to the browser.
For the chat, the gateway checks the job is yours, then analysis-svc turns the question into a
vector, finds the closest comments with pgvector, and asks the AI to answer from them only (RAG).

### Concepts to read

| Concept                             | Why it matters here                                                    | Read                                                                                                                                           |
| ----------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| JWT: header, payload, **signature** | the old guard only _decoded_ the payload; anyone could write their own | [jwt.io introduction](https://jwt.io/introduction)                                                                                             |
| Bearer tokens                       | the `Authorization: Bearer <token>` format the guard parses            | [RFC 6750, sections 2.1 and 3](https://datatracker.ietf.org/doc/html/rfc6750)                                                                  |
| NestJS guards, modules              | where the token check runs; how the gateway is split                   | [NestJS — Guards](https://docs.nestjs.com/guards), [NestJS — Modules](https://docs.nestjs.com/modules)                                         |
| BOLA / IDOR                         | reading another org's job by guessing its id                           | [OWASP API1:2023](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)                                     |
| DTO validation, rate limiting       | `CreateJobDto`, `RagQueryDto`, `@Throttle`                             | [NestJS — Validation](https://docs.nestjs.com/techniques/validation), [NestJS — Rate limiting](https://docs.nestjs.com/security/rate-limiting) |
| Swagger / OpenAPI in NestJS         | the gateway's generated API docs                                       | [NestJS — OpenAPI](https://docs.nestjs.com/openapi/introduction)                                                                               |
| CORS                                | why `origin: '*'` with credentials was too open                        | [MDN — CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)                                                                           |
| WebSocket gateways                  | `@WebSocketGateway`, `server.emit`                                     | [NestJS — Gateways](https://docs.nestjs.com/websockets/gateways)                                                                               |
| Job queues, Redis Pub/Sub           | `scrape-job` / `analyze-job` queues and the `job-events` channel       | [BullMQ docs](https://docs.bullmq.io/), [Redis — Pub/Sub](https://redis.io/docs/latest/develop/interact/pubsub/)                               |
| Sentiment analysis                  | VADER compound score, TextBlob subjectivity                            | [vaderSentiment](https://github.com/cjhutto/vaderSentiment), [TextBlob](https://textblob.readthedocs.io/en/dev/)                               |
| Embeddings                          | turning text into a 384-number vector                                  | [Sentence Transformers](https://sbert.net/)                                                                                                    |
| Vector search                       | the `<=>` cosine distance in Postgres                                  | [pgvector README](https://github.com/pgvector/pgvector)                                                                                        |
| RAG                                 | answer only from retrieved comments, with citations                    | [Retrieval-augmented generation](https://en.wikipedia.org/wiki/Retrieval-augmented_generation)                                                 |
| LLM API calls, model fallback       | why a list of models is tried in order                                 | [OpenRouter — Quickstart](https://openrouter.ai/docs/quickstart)                                                                               |
| API testing collections             | the `contracts/bruno` folder                                           | [Bruno docs](https://docs.usebruno.com/)                                                                                                       |

### Practices

1. **Verify, never decode.** A token's payload is readable by anyone; only the signature check makes it trustworthy.
2. **Fail closed.** Missing or wrong token → `401`. Never fall back to a default user.
3. **Every query by id also filters by org.** `WHERE id = $1` alone is a BOLA bug.
4. **Answer "not found" for another org's object**, not "forbidden", so nobody learns it exists.
5. **A service without auth (analysis-svc) is reachable only through one that has it** (the gateway).
6. **Decouple slow work with queues**: the API answers `201` at once, the work happens later, the status is pushed live.
7. **Always have a fallback for an external AI**, and tell the user when it was used.
8. **CORS lists who may call you**; `*` is only for public, read-only APIs.

### Exercises

1. **Forge a token.** Build a token by hand (header `{"alg":"HS256"}`, payload `{"sub":"x","org_id":"<any uuid>"}`, base64url, any third part) and send it to `GET /api/jobs`.
   **Check:** `401`. Explain in one sentence why the old guard would have answered `200`.
2. **Find the BOLA line.** Find the line in `jobs.service.ts` that stops you reading another org's job.
   **Check:** `GET /api/jobs/00000000-0000-4000-8000-000000000000` with your token → `404`.
3. **Rate limit.** Send 21 `POST /api/jobs` in a row with your token.
   **Check:** the last ones get `429`; find the `@Throttle` that sets the limit.
4. **Score a sentence.** Run `docker compose exec analysis-svc python -c "from app.sentiment import *; print(dir())"`, find the scoring function, and score "I love this app" and "support never answers".
   **Check:** the first compound is positive, the second negative.
5. **Vector size.** In pgAdmin, look at one `embedding` in `Comments`.
   **Check:** you can say why it has 384 numbers (the model in `app/embeddings.py`).
6. **RAG by hand.** `POST /api/rag/query` with a done job id and "What do users complain about?".
   **Check:** the answer only quotes comments listed in `citations`; explain why that is "grounded".
7. **Follow one event.** `docker compose logs -f gateway-svc`, submit a job, find the `Emitting WebSocket event` lines.
   **Check:** name which service published each status (`queued` = gateway, `failed` = scraper, `running`/`done` = analysis).
8. **Bruno.** Open `contracts/bruno` in Bruno, select `Local`, run `01-Health-Check`.
   **Check:** it passes; find the URL it uses in `environments/Local.bru`.

---

## 2. Madani — scraper-svc, Vault, nginx, new-job form

### A. What his branches brought into `dev`

**scraper-svc** (`feature/scraper-svc`, 12 files)

| File                                           | Status                | What it is for                                                                    |
| ---------------------------------------------- | --------------------- | --------------------------------------------------------------------------------- |
| `src/scraper_svc/__init__.py`                  | new                   | entry point `main()`: starts the worker                                           |
| `src/scraper_svc/ScrapingWorker.py`            | new                   | BullMQ worker on the queue `scrape-job`                                           |
| `src/scraper_svc/scrapers.py`                  | new                   | fetches a Reddit post's JSON with a session cookie                                |
| `pyproject.toml`, `uv.lock`, `.python-version` | changed / new         | a `uv` project on Python 3.13 with `bullmq` and `requests`; command `scraper-svc` |
| `README.md`                                    | new                   | how to run it and push a test job                                                 |
| `app/main.py`, `main.py`, `.gitignore`         | deleted               | the old FastAPI starter                                                           |
| `Dockerfile`                                   | deleted on the branch | re-added in section B                                                             |

**Vault** (`feature/vault`, 4 files + compose)

| File                                     | Status  | What it is for                                                                                         |
| ---------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| `vault/Dockerfile`                       | new     | `hashicorp/vault:1.15`, runs `server -dev` through a custom entrypoint                                 |
| `vault/tools/entrypoint.sh`              | new     | waits for Vault, then writes `secret/sessions` and `secret/database` from environment variables        |
| `vault/README.md`, `vault/.dockerignore` | new     | setup notes                                                                                            |
| `docker-compose.yml`                     | changed | the vault service builds from `./vault`, gets the secrets to seed, healthcheck reads `secret/database` |
| `.env.example`                           | changed | `REDDIT_SESSIONS`                                                                                      |

**New-job form, in the frontend** (from `feature/frontend-new-job`, came with PR #45)

| File                                                                                               | Status | What it is for                                                                                                                                             |
| -------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/new-job/new-scrape-form.tsx`, `scrape-input.tsx`, `scrape-type.tsx`, `label-input.tsx` | new    | a scrape form split in components. **Not used by any page today**: the dashboard uses `NewJobCard`. Either wire it in place of `NewJobCard`, or remove it. |

### B. What was changed so it works in `dev`

| File                                            | New? | What changed                                                                                                                        |
| ----------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `scraper-svc/Dockerfile`                        | new  | the branch had deleted it, so the image couldn't build                                                                              |
| `scraper-svc/.dockerignore`                     | new  |                                                                                                                                     |
| `scraper-svc/src/scraper_svc/ScrapingWorker.py` |      | Redis host from env; forwards comments to `analyze-job`; reports failures                                                           |
| `scraper-svc/src/scraper_svc/scrapers.py`       |      | official Reddit API with a cookie fallback; the 4 modes; comment replies                                                            |
| `nginx/Dockerfile`                              |      | config installed as a template (nginx couldn't start)                                                                               |
| `nginx/nginx.conf`                              |      | port 8080; `/api` prefix kept; `/healthz`; `/socket.io/`; reporting behind the token check; temporary auth routes; security headers |
| `docker-compose.yml`                            |      | nginx `80→8080`, healthcheck, WAF `ALLOWED_METHODS`                                                                                 |

### How it works

nginx is the only door (port 80). Its WAF (ModSecurity + OWASP rules) inspects every request
and blocks attacks with `403`. Then it routes: `/api/auth`, `/api/orgs` → auth-svc;
`/api/reporting` → asks auth-svc to check the token first, then reporting-svc with the org from
the token; `/socket.io/` and other `/api` → gateway; everything else → the frontend.
The scraper waits on `scrape-job`, reads Reddit (official API if `REDDIT_CLIENT_ID/SECRET` are
set, else a session cookie), and hands the comments to analysis through `analyze-job`.
Vault runs in **dev mode** and holds two seeded secrets, but no service reads from it yet
(see `vault-waf-module.md` for what the module needs).

### Concepts to read

| Concept                      | Why it matters here                                                        | Read                                                                                                                                                                                                                                |
| ---------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Job queues, workers, retries | `scrape-job` → scraper → `analyze-job`                                     | [BullMQ for Python](https://docs.bullmq.io/python/introduction)                                                                                                                                                                     |
| The asyncio event loop       | `requests` blocks; `asyncio.to_thread` keeps the worker free (team rule 7) | [Python — Coroutines and tasks](https://docs.python.org/3/library/asyncio-task.html)                                                                                                                                                |
| Python projects with uv      | `pyproject.toml`, `uv.lock`, `uv sync`, `uv run`                           | [uv docs](https://docs.astral.sh/uv/)                                                                                                                                                                                               |
| OAuth2 client credentials    | how the scraper logs in to Reddit's API                                    | [Reddit — OAuth2 wiki](https://github.com/reddit-archive/reddit/wiki/OAuth2)                                                                                                                                                        |
| Dockerfile basics            | layers, `COPY` order, `.dockerignore`                                      | [Docker — Build best practices](https://docs.docker.com/build/building/best-practices/)                                                                                                                                             |
| Reverse proxy, `proxy_pass`  | why a trailing `/` removes the `/api` prefix                               | [nginx — proxy module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)                                                                                                                                                   |
| WebSocket through nginx      | `Upgrade` / `Connection` headers                                           | [nginx — WebSocket proxying](https://nginx.org/en/docs/http/websocket.html)                                                                                                                                                         |
| `auth_request`               | nginx asks auth-svc before forwarding to reporting                         | [nginx — auth_request module](https://nginx.org/en/docs/http/ngx_http_auth_request_module.html)                                                                                                                                     |
| Security headers             | `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `frame-ancestors`         | [OWASP — HTTP headers cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)                                                                                                                    |
| WAF, OWASP Core Rule Set     | paranoia levels, `ALLOWED_METHODS`, anomaly scores                         | [modsecurity-crs-docker](https://github.com/coreruleset/modsecurity-crs-docker), [CRS docs](https://coreruleset.org/docs/)                                                                                                          |
| Vault dev mode, KV, sealing  | why dev mode is not "encrypted and isolated"                               | [Vault dev server](https://developer.hashicorp.com/vault/docs/concepts/dev-server), [KV v2](https://developer.hashicorp.com/vault/docs/secrets/kv/kv-v2), [Seal / unseal](https://developer.hashicorp.com/vault/docs/concepts/seal) |

### Practices

1. **Never block the event loop** in async code: run blocking libraries in a thread.
2. **Report a failure only after the last retry.**
3. **Configuration comes from the environment**, never `localhost` inside a container.
4. **A container must start, not only build** — test `docker compose up`, not only `build`.
5. **Read the base image's docs** (user, port, entrypoint) before overriding its files.
6. **Security headers and the WAF belong at the edge**, once, for every service.
7. **A secret store only counts if services read from it** — seeding Vault is not using Vault.
8. **Don't leave unused code** (the `new-job` components): wire it or delete it.

### Exercises

1. **Trailing slash.** Compare `proxy_pass http://gateway-svc:3001;` with `…:3001/;`.
   **Check:** predict the path the gateway receives for `GET /api/health` in both cases, and why the second gave `404`.
2. **Who checks the token for reporting?** `curl -i http://localhost/api/reporting` without a token, then with only `-H "org-id: <your org>"`.
   **Check:** both `401`; find the two `nginx.conf` lines that take `org-id` from the token.
3. **WAF.** Send `curl -s -o /dev/null -w "%{http_code}\n" "http://localhost/api/health?id=1'%20OR%20'1'='1"`, then a `PUT`.
   **Check:** both `403`; run `docker compose logs nginx | grep ModSecurity | tail -3` and find each rule id.
4. **Blocking vs not.** Find `asyncio.to_thread` in `ScrapingWorker.py`.
   **Check:** explain what would happen to other jobs if `scrape_mode` were called directly.
5. **Failed scrape.** Without Reddit credentials, submit a job and watch `docker compose logs -f scraper-svc`.
   **Check:** 3 tries, one `failed` event, and the reason shown under the form.
6. **What Vault holds.** Run `docker compose exec vault sh -c 'VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=$VAULT_DEV_ROOT_TOKEN_ID vault kv get secret/database'`, then `vault status`.
   **Check:** you see the database secret, `Storage Type inmem`; explain why this does not validate the module yet.
7. **Unused code.** Search where `new-scrape-form` is imported (`grep -rn new-scrape-form frontend/app frontend/components`).
   **Check:** nowhere; decide with Hamza whether to wire it or delete it.

---

## 3. Oussama — reporting-svc, database, dashboard pieces

### A. What his work brought into `dev`

reporting-svc itself and the database schema were merged **before** today (PR #43). Today his
frontend work came in with PR #45:

| File / folder                                                                               | Status        | What it is for                                                                   |
| ------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------- |
| the `frontend/` folder replacement (from `feature/frontend-dashboard`)                      | renamed / new | the dashboard base the team builds on (`app/old/*`, `favicon.ico` moved)         |
| `components/dashboard/visualizer-card.tsx`, `home/RevenueOverview.tsx`                      | new           | the VADER sentiment chart (Recharts)                                             |
| `components/dashboard/layout/sidebar.tsx` (jobs list part)                                  | new           | the jobs list in the sidebar                                                     |
| `hooks/useReports.ts`, `useReportById.ts`, `useDeleteRepById.ts`, `use-exportReport.ts`     | new           | React Query hooks for reporting-svc                                              |
| `lib/api/organizationReports.ts`, `getReportById.ts`, `exportReport.ts`, `DeleteRepById.ts` | new           | the HTTP calls to reporting-svc (list, one report, CSV/XLSX/JSON export, delete) |

### B. What was changed so it works in `dev`

| File                                                     | New? | What changed                                                                                                                    |
| -------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| `docker-compose.yml`                                     |      | **MinIO** service added (reporting-svc crashed at start without it); its keys passed as `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` |
| `.env.example`                                           |      | `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`                                                                                        |
| `nginx/nginx.conf`                                       |      | `/api/reporting/` → reporting-svc **after** auth-svc checked the token; `org-id` set from the token                             |
| `frontend/lib/api/*` (his 4 files)                       |      | `/api/reporting` with the login token instead of `localhost:3003` and a hard-coded `org-id`; empty org → `[]`                   |
| `frontend/hooks/useReportById.ts`, `useDeleteRepById.ts` |      | React Query cache per job; the job list refreshes after a delete                                                                |
| `frontend/components/dashboard/home/RevenueOverview.tsx` |      | shows the **selected** job (`?job=`), not the user id                                                                           |

### How it works

reporting-svc has no login check of its own: it trusts the `org-id` header. So it must only be
reachable through nginx, which asks auth-svc "who is this token?" and writes the answer into
`org-id`, overwriting anything the browser sent. reporting-svc then reads the org's jobs and the
selected job's report, and groups the comments' sentiment by day for the chart.

### Concepts to read

| Concept                        | Why it matters here                                | Read                                                                                                                               |
| ------------------------------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Object storage (S3-compatible) | reporting-svc's backups need MinIO                 | [MinIO — container deployment](https://min.io/docs/minio/container/index.html)                                                     |
| Startup order, healthchecks    | `depends_on: { condition: service_healthy }`       | [Docker Compose — startup order](https://docs.docker.com/compose/how-tos/startup-order/)                                           |
| Env variables in compose       | `environment:` beats `env_file:`                   | [Docker Compose — environment variables](https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/) |
| Forward auth                   | how nginx protects a service that has no auth      | [nginx — auth_request module](https://nginx.org/en/docs/http/ngx_http_auth_request_module.html)                                    |
| Server state in React          | the report hooks and their cache                   | [TanStack Query — Query invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)            |
| Charts                         | the sentiment chart                                | [Recharts](https://recharts.github.io/)                                                                                            |
| pgvector                       | the 384-number embeddings stored with the comments | [pgvector README](https://github.com/pgvector/pgvector)                                                                            |

### Practices

1. **A service that trusts a header must sit behind something that sets it**, and overwrites any client value.
2. **An empty list is `200 []`, not `404`.**
3. **Every dependency a service needs at start is in the compose file**, with a healthcheck.
4. **No hard-coded ids in API calls** (the old `org-id`): they come from the login.

### Exercises

1. **Forged header.** With your token, call `GET /api/reporting/<your job id>` with `-H "org-id: 00000000-0000-4000-8000-000000000000"`.
   **Check:** still `200` with your data; explain which nginx line made the forged value useless.
2. **Startup order.** `docker compose stop minio`, then `docker compose restart reporting-svc` and read its log.
   **Check:** the `minio` error; then start minio and restart reporting again.
3. **Export.** From the dashboard, select a done job and use **Export data → CSV**.
   **Check:** a file downloads; find the route in `lib/api/exportReport.ts` and in reporting-svc's controller.
4. **Empty org.** Sign up a new account and open its dashboard.
   **Check:** "No jobs yet", not an error; find the `404 → []` line in `organizationReports.ts`.

---

## 4. Hamza — frontend app, UI, landing page, CI

### A. What his branch brought into `dev` (PR #45, about 110 files)

| Folder / file                                                                                          | Status        | What it is for                                                         |
| ------------------------------------------------------------------------------------------------------ | ------------- | ---------------------------------------------------------------------- |
| `app/layout.tsx`, `app/providers.tsx`, `app/theme-provider.tsx`, `app/globals.css`                     | new           | root layout, React Query provider, dark/light theme, Tailwind styles   |
| `app/page.tsx`, `app/about`, `app/contact`                                                             | new           | landing, about and contact pages                                       |
| `sections/` (33 files)                                                                                 | new           | the landing page blocks (hero, features, pricing, FAQ, technologies…)  |
| `app/(dashboard)/[uuid-user]/layout.tsx`, `dashboard/page.tsx`, `billing/page.tsx`, `setting/page.tsx` | new           | the dashboard pages under the user id                                  |
| `components/dashboard/` (15 files)                                                                     | new           | navbar, sidebar, welcome card, counters, SWOT cards, theme toggle      |
| `components/ui/` (22 files)                                                                            | new           | shadcn/ui components (button, card, dropdown, sidebar, chart, dialog…) |
| `components/auth/` (auth-card, header, layout, footer, social-login)                                   | new           | the shared look of the login pages                                     |
| `app/(Authentication)/verify-email` and the base of login / register / forgot / reset                  | new           | auth page designs (wired by Mehdi)                                     |
| `components/navbar.jsx`, `footer.jsx`, `public/`                                                       | new           | landing navbar, footer, images                                         |
| `components.json`, `tsconfig.json`, `package.json`, `pnpm-lock.yaml`, `README.md`                      | new / changed | shadcn config, TypeScript paths, dependencies                          |
| `dockerfile`, `ci-frontend.yml`                                                                        | new           | frontend image; a frontend CI file                                     |
| `src/`, `Dockerfile`                                                                                   | deleted       | the old frontend                                                       |

### B. What was changed so it works in `dev`

| Area           | Files                                                                                                                                                                                                 | What changed                                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Login and user | `components/auth/auth-guard.tsx` (new), `[uuid-user]/layout.tsx`, `hooks/useCurrentUser.ts` (new), `lib/auth.ts`, `layout/navbar.tsx`, `home/welcome.tsx`                                             | login guard; real user in the navbar and welcome card; Log out menu                                                    |
| Sidebar        | `layout/sidebar.tsx`                                                                                                                                                                                  | real user id in the links (they were `/33/…`); Members item; job list with status                                      |
| Jobs           | `home/NewJobCard.tsx` (new), `home/JobsPanel.tsx` (new), `hooks/useJobsLive.ts` (new), `hooks/useJobEvents.ts`, `lib/api/createJob.ts` (new), `lib/api/jobs.ts` (new)                                 | job form and live Jobs panel                                                                                           |
| Report         | `hooks/useSelectedJob.ts` (new), `hooks/useReportById.ts`, `app/types/report.ts`, `home/RevenueOverview.tsx`, `home/Strategic.tsx`, `swot-cards.tsx`, `home/SummaryMetrics.tsx`, `dashboard/page.tsx` | report of the selected job (`?job=`); SWOT items shown (they were commented out); real job counts (they were 10/20/40) |
| API calls      | `lib/api/organizationReports.ts`, `getReportById.ts`, `exportReport.ts`, `DeleteRepById.ts`, `hooks/useDeleteRepById.ts`                                                                              | through `/api/reporting` with the token, no hard-coded org                                                             |
| Chat           | `message/ChatWidget.tsx`, `message/FloatingChatWidget.tsx`                                                                                                                                            | asks about the selected job, with the token; real errors                                                               |
| Members        | `[uuid-user]/members/page.tsx` (new), `hooks/useMembers.ts` (new), `lib/api/members.ts` (new), `home/StrategicUsers.tsx`                                                                              | Members page; real member count                                                                                        |

### How it works

Next.js App Router: each folder under `app/` is a URL. Folders in parentheses, like
`(dashboard)` and `(Authentication)`, group pages **without** appearing in the URL; `[uuid-user]`
is a variable part of the URL. The dashboard layout wraps every logged-in page with the guard,
sidebar, navbar and chat. Data comes from the API through React Query: each piece of data has a
key (`["jobs"]`, `["report", id]`, `["members", org]`), and every component using the same key
shares one cached copy; WebSocket events update that copy live.

### Concepts to read

| Concept                                    | Why it matters here                                    | Read                                                                                                                                                                                                                                                                     |
| ------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| App Router, route groups, dynamic segments | `(dashboard)`, `[uuid-user]`                           | [Next.js — Routing](https://nextjs.org/docs/app/building-your-application/routing), [Route groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups), [Dynamic routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) |
| URL state                                  | the selected job in `?job=`, the user in `[uuid-user]` | [useSearchParams](https://nextjs.org/docs/app/api-reference/functions/use-search-params), [useParams](https://nextjs.org/docs/app/api-reference/functions/use-params)                                                                                                    |
| UI components                              | the `components/ui` folder and `components.json`       | [shadcn/ui docs](https://ui.shadcn.com/docs)                                                                                                                                                                                                                             |
| Server state and caching                   | one cache shared by sidebar, Jobs panel and counters   | [TanStack Query — Query invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation), [Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)                                                            |
| Effects, and when not to use them          | the `setState`-in-effect lint errors                   | [React — You might not need an effect](https://react.dev/learn/you-might-not-need-an-effect)                                                                                                                                                                             |
| Socket.IO client                           | connecting through nginx on the page's own origin      | [Socket.IO — Client initialization](https://socket.io/docs/v4/client-initialization/)                                                                                                                                                                                    |
| TypeScript types                           | the props types that broke `next build`                | [TypeScript — Everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)                                                                                                                                                                        |
| Client guard vs server auth                | hiding a page is not security                          | [OWASP API1:2023](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)                                                                                                                                                               |

### Practices

1. **No hard-coded ids** (`/33/dashboard`, a fixed `org-id`, a demo job id): read them from the URL or the logged-in user.
2. **One source of truth per piece of data**: one query key, many components.
3. **The frontend never decides security**: hiding a button is UX; the server must refuse.
4. **Show real errors**, never an invented answer or fake numbers.
5. **Same-origin API calls** (`/api/...`), so the app works behind nginx and later on HTTPS.
6. **Run `pnpm build` before pushing**: `pnpm dev` doesn't type-check, the build does.

### Exercises

1. **Route groups.** Open `app/(dashboard)/[uuid-user]/members/page.tsx` and predict its URL.
   **Check:** `/<your user id>/members` — no `(dashboard)` in it; explain why.
2. **The guard.** Log out, then paste the dashboard URL.
   **Check:** `/login`; name the two cases in `auth-guard.tsx` that redirect.
3. **One cache, three views.** Submit a job; watch the sidebar, the Jobs panel and the counters.
   **Check:** find the key they share and the line in `useJobsLive.ts` that updates it.
4. **Real data shape.** `curl -s -H "Authorization: Bearer $TOKEN" http://localhost/api/reporting/<done job id>` and find `blue_ocean`.
   **Check:** explain why the old code (`blue_ocean.eliminate`) always showed nothing.
5. **Build vs dev.** Remove the type from `VisualizerCard`'s props and run `pnpm build` in `frontend/`.
   **Check:** the build fails with `implicitly has an 'any' type`; put it back.
6. **UI vs server.** Log in as a Viewer and call `PATCH /api/orgs/<org>/members/<id>` with that token.
   **Check:** `403` although the page hides the dropdown.

---

## 5. Mehdi — auth-svc and the auth pages

### A. What his branches brought into `dev`

**auth-svc** (`feature/auth-svc`, 49 files)

| Area               | Files                                                                                                                                                     | What it is for                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Database           | `prisma/schema.prisma`, `prisma7.config.ts`, `src/prisma/prisma.service.ts`, `prisma.module.ts`, `prisma/migrations/*` (local only)                       | copy of Oussama's `User`, `Organization`, `role_and_organization` tables; Prisma 7 with the `pg` adapter                                         |
| Auth routes        | `src/auth/auth.controller.ts`, `auth.service.ts`, `auth.module.ts`                                                                                        | signup, login, me, 42 OAuth (start, callback, complete), invite accept, change / forgot / reset password, GDPR export and delete, verify, logout |
| Auth DTOs          | `src/auth/dto/` (register, login, complete-42, accept-invite, change-password, forgot-password, reset-password, delete-account, index)                    | body validation for each route                                                                                                                   |
| Guards, strategies | `guard/jwt.guard.ts`, `guard/42.guard.ts`, `strategy/jwt.strategy.ts`, `strategy/42.strategy.ts`, `token-denylist.service.ts`                             | Passport JWT (refuses purpose and logged-out tokens) and 42 OAuth                                                                                |
| Organizations      | `src/org/org.controller.ts`, `org.service.ts`, `org.module.ts`, `src/org/dto/` (update-org, invite-member, update-member, index)                          | org read/update/delete; members list, invite, change role, remove (Admin only, last-Admin rule)                                                  |
| Mail               | `src/mail/mail.module.ts`, `mail.service.ts`                                                                                                              | Mailtrap SMTP: invite, reset password, GDPR receipts                                                                                             |
| App                | `src/main.ts`, `src/app.module.ts`, `src/app.controller.ts`; `src/users/*`                                                                                | ValidationPipe with `whitelist`, module wiring; `users` is still empty                                                                           |
| Tooling            | `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.env.example`, `.gitignore`, `.dockerignore`, `docker-compose.yml`, `COMMANDS.md`, `Dockerfile` | dependencies, placeholders, local Postgres, command cheat sheet, image                                                                           |
| Removed            | `src/app.service.ts`, `src/app.controller.spec.ts`                                                                                                        | NestJS starter files                                                                                                                             |

**Auth pages** (`feature/auth-frontend`, in PR #45)

| File                                                                      | Status | What it is for                                                                              |
| ------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| `lib/auth.ts`                                                             | new    | login, register, 42 completion, invite accept, forgot/reset password, token storage, logout |
| `app/(Authentication)/login`, `register`                                  | new    | wired to the real API, with validation                                                      |
| `app/(Authentication)/auth/42/done`, `auth/42/complete`                   | new    | land after 42 login; finish a first 42 signup (org name and description)                    |
| `app/(Authentication)/invite/accept`, `forgot-password`, `reset-password` | new    | invite link page, password reset by email                                                   |
| `components/auth/password-input.tsx`                                      | new    | show/hide password field                                                                    |

### B. What was changed so it works in `dev`

| File                                          | New? | What changed                                                         |
| --------------------------------------------- | ---- | -------------------------------------------------------------------- |
| `auth-svc/Dockerfile`                         |      | builds now (debian, `prisma generate`, no migrations)                |
| `auth-svc/.dockerignore`                      | new  |                                                                      |
| `auth-svc/src/auth/auth.controller.ts`        |      | `GET /auth/verify` for nginx; `POST /auth/logout`                    |
| `auth-svc/src/auth/token-denylist.service.ts` | new  | block list for logged-out tokens                                     |
| `auth-svc/src/auth/strategy/jwt.strategy.ts`  |      | refuses logged-out tokens                                            |
| `auth-svc/src/auth/auth.module.ts`            |      | registers the block list                                             |
| `.env.example`, `nginx/nginx.conf`            |      | auth-svc variables; `/api/auth/` and `/api/orgs/` routed to auth-svc |

### How it works

Signup creates the org, the user (password hashed with argon2) and the Admin role in **one
transaction**, then signs a 1-hour JWT `{ sub, org_id, role }`. Every protected route runs the
JWT strategy: right signature, not expired, no `purpose`, not logged out. Short "purpose" tokens
(signup 10 min, invite 48 h, reset 15 min) travel in the URL fragment and can only be used on
their own route. Org routes check the org in the URL is the token's org (else `404`) and the role
(else `403`). nginx calls `/auth/verify` to protect reporting-svc.

### Concepts to read

| Concept                     | Why it matters here                                                   | Read                                                                                                                               |
| --------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Stateless tokens and logout | a JWT can't be deleted, so logout needs a block list until it expires | [jwt.io introduction](https://jwt.io/introduction)                                                                                 |
| Passport in NestJS          | JWT and 42 strategies, guards                                         | [NestJS — Passport](https://docs.nestjs.com/recipes/passport), [NestJS — Guards](https://docs.nestjs.com/guards)                   |
| Password hashing            | why argon2 and never plain or reversible                              | [OWASP — Password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)                       |
| Transactions                | org + user + role created all-or-nothing                              | [Prisma — Transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)                                         |
| Prisma client generation    | `prisma generate` at build, never `migrate` (Oussama owns the schema) | [Prisma — Generating Prisma Client](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client) |
| Validation with whitelist   | unknown body fields are dropped (no mass assignment)                  | [NestJS — Validation](https://docs.nestjs.com/techniques/validation)                                                               |
| Sending mail                | the mailer module with SMTP                                           | [NestJS mailer](https://nest-modules.github.io/mailer/)                                                                            |
| Forward auth                | `/auth/verify` answers with headers, not a body                       | [nginx — auth_request module](https://nginx.org/en/docs/http/ngx_http_auth_request_module.html)                                    |
| Docker images for Node      | glibc vs musl (argon2), `.dockerignore`                               | [Docker — Build best practices](https://docs.docker.com/build/building/best-practices/)                                            |

### Practices

1. **The service that issues tokens knows when they are revoked** — others should ask it.
2. **Several writes that belong together go in one transaction.**
3. **One token, one purpose**: signup, invite and reset tokens can't log you in.
4. **Not found, not forbidden, for another org** (BOLA-safe).
5. **Build-time vs run-time**: generate the client while building; never migrate a schema you don't own.
6. **In-memory state disappears on restart**; shared state goes in Redis.

### Exercises

1. **Logout for real.** `/api/auth/me` (200) → `POST /api/auth/logout` (204) → `/api/auth/me` again.
   **Check:** `401`. Restart auth-svc and call `/me` with the same token: explain the result.
2. **Logout gap.** After logging out, call `GET /api/jobs` with the same token.
   **Check:** it still works; explain who checks the token on that route (issue Y3).
3. **Hashes.** In pgAdmin, open `User` and look at your `password`.
   **Check:** it starts with `$argon2id$`; explain why nobody can read the password back.
4. **Whitelist.** Sign up with an extra field `"role":"Admin","is_2fa_enabled":true` in the body.
   **Check:** the extra fields are ignored; find `whitelist: true` in `main.ts`.
5. **Purpose tokens.** Use an invite token (from an invite email link) as `Authorization: Bearer` on `/api/auth/me`.
   **Check:** `401`; find the line in `jwt.strategy.ts`.
6. **Forward auth.** `curl -i http://localhost/api/auth/verify -H "Authorization: Bearer $TOKEN"`.
   **Check:** `204` with `X-User-Id`, `X-Org-Id`, `X-Role`.
7. **Why not alpine.** Change `node:22-slim` to `node:22-alpine` in `auth-svc/Dockerfile` and build.
   **Check:** read the `argon2` error, then put it back.

---

## 6. Shared files

| File                 | Owner    | What changed (and for whom)                                                                                                                                                   |
| -------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docker-compose.yml` | Hamza    | vault service (Madani); nginx port `80→8080`, healthcheck, WAF `ALLOWED_METHODS` (Madani); MinIO and reporting's MinIO keys (Oussama); analysis reads `analyze-job` (Youssef) |
| `.env.example`       | everyone | `REDDIT_SESSIONS` (Madani); auth-svc, MinIO and OpenRouter variables — placeholders only                                                                                      |
| `.gitignore`         | Youssef  | Python and pnpm artifacts                                                                                                                                                     |

### Concepts to read

| Concept                               | Why it matters here                                 | Read                                                                                                                               |
| ------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `environment` vs `env_file`, `${VAR}` | which value a container really gets                 | [Docker Compose — environment variables](https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/) |
| Healthchecks and `depends_on`         | start order of nginx, MinIO, Postgres, Redis, Vault | [Docker Compose — startup order](https://docs.docker.com/compose/how-tos/startup-order/)                                           |

### Practices

1. **`.env.example` lists every variable with a placeholder; `.env` holds the real values and is never committed** (a real secret in the repo = immediate fail at the evaluation).
2. **Never share `.env` in a chat or a screenshot**; send values privately and rotate any that leaked.
3. **One compose file runs everything**, so a fresh machine needs only `.env` + `docker compose up`.

### Exercises

1. **What compose really runs.** `docker compose config | grep -A6 "  minio:"`.
   **Check:** the variables are already replaced by your `.env` values; say where each came from.
2. **Missing variable.** Rename `MINIO_ROOT_PASSWORD` in your `.env` for a moment and run `docker compose config --quiet`.
   **Check:** read the warning, then put it back.
3. **Fresh clone.** Clone the repo in a new folder, copy only `.env`, run `docker compose up -d --build`.
   **Check:** every service comes up; this is what the evaluator does.

---

## Order to study (about 8 hours)

| Step | Section               | Why                                                                 |
| ---- | --------------------- | ------------------------------------------------------------------- |
| 1    | 5 (auth-svc)          | JWT, guards and org rules are the base of everything                |
| 2    | 1 (gateway)           | the same ideas, plus queues, events, BOLA, CORS                     |
| 3    | 2 (nginx, WAF, Vault) | how all services are tied together and protected                    |
| 4    | 1 (analysis)          | sentiment, embeddings, RAG — the "intelligence" part of the project |
| 5    | 4 (frontend)          | how the browser uses all of it                                      |
| 6    | 2 (scraper), 3, 6     | Reddit, storage, compose                                            |
