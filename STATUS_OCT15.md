# Project Status — Oct 15 (Post-Integration)

> What's in `dev`, what each person built, what still needs doing before evaluation.

---

## 1. What's in `dev` Right Now

Two PRs merged on Oct 14:

| PR                            | What it brought                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| **#45** `feature/frontend`    | Hamza's full dashboard, Mehdi's auth pages, Oussama's reporting UI, Youssef's chat (ported) |
| **#46** `feature/integration` | All 5 service branches merged, then 11 fix commits to make the whole stack run together     |

After those merges + the `.dockerignore` / nginx fix committed to `dev` locally:

```
docker compose ps   →   14 services Up, all healthy
http://localhost/   →   200 OK  (Next.js dashboard)
http://localhost/healthz  →  200 OK
http://localhost/api/health  →  200 OK  (gateway-svc)
http://localhost:8001/health →  200 OK  (analysis-svc, direct)
```

---

## 2. What Each Person Built (and What the Integration Fixed)

### Youssef — analysis-svc + gateway-svc + frontend chat

**Built on feature branches (done, merged):**

| What                             | File / endpoint                            | Status  |
| -------------------------------- | ------------------------------------------ | ------- |
| VADER sentiment scoring          | `app/sentiment.py` → `POST /analyze`       | ✅ done |
| TextBlob subjectivity            | `app/sentiment.py`                         | ✅ done |
| MiniLM 384-dim embeddings        | `app/embeddings.py` (all-MiniLM-L6-v2)     | ✅ done |
| pgvector cosine search           | `app/database.py` `<=>` operator           | ✅ done |
| 70/30 hybrid reranker            | `app/ranking.py` (similarity + upvotes)    | ✅ done |
| Context Canvas builder           | `app/canvas.py` + `skills/` .md prompts    | ✅ done |
| SWOT + Blue Ocean synthesis      | `app/synthesis.py` → OpenRouter            | ✅ done |
| RAG follow-up endpoint           | `POST /rag/query` (FastAPI)                | ✅ done |
| Redis pub/sub events publish     | `app/events.py` → `job-events` channel     | ✅ done |
| BullMQ worker (analyze-job)      | `app/worker.py`                            | ✅ done |
| 20/20 pytest passing             | `tests/test_main.py`                       | ✅ done |
| NestJS JWT guard                 | `gateway-svc/src/auth/jwt-auth.guard.ts`   | ✅ done |
| BullMQ producer (scrape-job)     | `gateway-svc/src/jobs/jobs.service.ts`     | ✅ done |
| Socket.IO + Redis subscriber     | `gateway-svc/src/events/events.gateway.ts` | ✅ done |
| POST /api/jobs                   | `gateway-svc/src/jobs/jobs.controller.ts`  | ✅ done |
| GET /api/jobs, GET /api/jobs/:id | `gateway-svc`                              | ✅ done |
| Chat widget + CitationModal      | `frontend/components/message/*`            | ✅ done |
| `useJobEvents` Socket.IO hook    | `frontend/hooks/useJobEvents.ts`           | ✅ done |
| Next.js RAG proxy route          | `frontend/app/api/rag/query/route.ts`      | ✅ done |

**Fixed during integration (PR #46):**

| Problem                                                                | Fix                                                   |
| ---------------------------------------------------------------------- | ----------------------------------------------------- |
| `JwtAuthGuard` was only decoding payload, not verifying HMAC signature | Added `jwt.verify(secret)` + refuses `purpose` tokens |
| `GET /api/jobs` returned ALL jobs (BOLA)                               | Added `AND org_id = $2` to every job/report query     |
| Missing `GET /api/jobs` list route                                     | Added to controller                                   |
| Missing `POST /api/rag/query` forwarding route                         | Added → proxies to analysis-svc                       |
| CORS was `origin: '*'` with credentials                                | Restricted to `FRONTEND_URL` env var                  |
| `QUEUE_NAME` missing in analysis-svc container                         | Added to docker-compose.yml                           |
| Old free AI models returned 404                                        | Replaced with `nvidia/nemotron-3.5-lightning:free`    |
| `max_tokens=150` starved reasoning model → empty answer                | Raised to `max_tokens=768`                            |
| `.next/` stale artifacts polluting Docker build                        | Created `frontend/.dockerignore`                      |
| nginx permission denied on conf.d                                      | Added `chown` in nginx Dockerfile                     |

---

### Hamza — frontend app (PR #45, ~110 files)

**Built:**

| What                                                                         | File / location                              | Status  |
| ---------------------------------------------------------------------------- | -------------------------------------------- | ------- |
| Next.js App Router layout (`(dashboard)`, `(Authentication)`, `[uuid-user]`) | `app/` folders                               | ✅ done |
| Landing page (hero, features, pricing, FAQ)                                  | `sections/` (33 files)                       | ✅ done |
| Dashboard pages (dashboard, billing, setting)                                | `app/(dashboard)/[uuid-user]/`               | ✅ done |
| Auth guard (`useCurrentUser` + redirect to /login)                           | `components/auth/auth-guard.tsx`             | ✅ done |
| Real user in navbar, sidebar links using real UUID                           | `layout/navbar.tsx`, `layout/sidebar.tsx`    | ✅ done |
| Jobs panel + live status via useJobsLive                                     | `home/JobsPanel.tsx`, `hooks/useJobsLive.ts` | ✅ done |
| New job submission card                                                      | `home/NewJobCard.tsx`                        | ✅ done |
| Report view: SWOT cards, Strategic, SummaryMetrics                           | `home/Strategic.tsx`, `swot-cards.tsx`       | ✅ done |
| Members page (invite, change role, remove)                                   | `[uuid-user]/members/page.tsx`               | ✅ done |
| Sentiment chart (Recharts, by day)                                           | `home/RevenueOverview.tsx`                   | ✅ done |
| shadcn/ui component library (22 UI components)                               | `components/ui/`                             | ✅ done |
| React Query provider, dark/light theme                                       | `app/providers.tsx`, `theme-provider.tsx`    | ✅ done |
| TanStack Query for all data (jobs, reports, members)                         | `hooks/use*.ts`, `lib/api/*`                 | ✅ done |
| Chat widget wired to selected job + real token                               | `message/ChatWidget.tsx`                     | ✅ done |
| CI for frontend                                                              | `.github/workflows/ci-frontend.yml`          | ✅ done |

---

### Mehdi — auth-svc (49 files)

**Built:**

| What                                                               | Endpoint / file                                           | Status  |
| ------------------------------------------------------------------ | --------------------------------------------------------- | ------- |
| Signup (creates org + user + Admin role in one transaction)        | `POST /api/auth/register`                                 | ✅ done |
| Login (argon2 verify → JWT `{sub, org_id, role, exp}`)             | `POST /api/auth/login`                                    | ✅ done |
| `GET /api/auth/me`                                                 | JWT protected                                             | ✅ done |
| 42 OAuth (start + callback + complete first signup)                | `GET /api/auth/42`, `/api/auth/42/callback`               | ✅ done |
| Invite member by email                                             | `POST /api/orgs/:id/members/invite`                       | ✅ done |
| Forgot / reset password by email                                   | `POST /api/auth/forgot-password`                          | ✅ done |
| GDPR export + delete                                               | `GET /api/auth/gdpr/export`                               | ✅ done |
| Passport JWT strategy (verifies HMAC, refuses `purpose` tokens)    | `strategy/jwt.strategy.ts`                                | ✅ done |
| Token denylist (Redis-backed, logout-safe)                         | `token-denylist.service.ts`                               | ✅ done |
| Org management (read/update/delete, Admin only)                    | `org.controller.ts`                                       | ✅ done |
| Member management (invite, change role, remove)                    | `org.service.ts`                                          | ✅ done |
| `GET /auth/verify` for nginx forward-auth                          | Returns `204` + `X-User-Id`, `X-Org-Id`, `X-Role` headers | ✅ done |
| Auth pages (login, register, 42 flow, invite accept, forgot/reset) | `app/(Authentication)/*`                                  | ✅ done |
| Prisma 7 + pg adapter (generates client, never migrates)           | `prisma/schema.prisma`                                    | ✅ done |
| Mail (Mailtrap SMTP: invite, reset, GDPR receipts)                 | `mail.service.ts`                                         | ✅ done |

---

### Madani — scraper-svc + nginx + Vault

**Built:**

| What                                                                   | File / service                                   | Status                |
| ---------------------------------------------------------------------- | ------------------------------------------------ | --------------------- |
| BullMQ worker on `scrape-job` queue                                    | `scraper-svc/src/scraper_svc/ScrapingWorker.py`  | ✅ done               |
| Reddit API scraper (official OAuth + session cookie fallback)          | `scraper-svc/src/scraper_svc/scrapers.py`        | ✅ done               |
| Forwards comments to `analyze-job` queue                               | `ScrapingWorker.py`                              | ✅ done               |
| Reports `failed` event on all retries exhausted                        | `ScrapingWorker.py`                              | ✅ done               |
| nginx OWASP ModSecurity WAF (CRS)                                      | `nginx/nginx.conf` + `nginx/Dockerfile`          | ✅ done               |
| nginx routing: auth-svc, reporting (forward-auth), gateway, frontend   | `nginx/nginx.conf`                               | ✅ done               |
| nginx security headers (`X-Frame-Options`, `nosniff`, etc.)            | `nginx/nginx.conf`                               | ✅ done               |
| `/healthz` endpoint                                                    | `nginx/nginx.conf`                               | ✅ done               |
| Socket.IO proxying (Upgrade/Connection headers)                        | `nginx/nginx.conf`                               | ✅ done               |
| Vault dev-mode container (seeds `secret/sessions` + `secret/database`) | `vault/Dockerfile` + `vault/tools/entrypoint.sh` | ✅ done (seeded only) |

---

### Oussama — reporting-svc + database schema + MinIO

**Built (before Oct 14, merged in PR #43):**

| What                                                                                     | File / endpoint                    | Status  |
| ---------------------------------------------------------------------------------------- | ---------------------------------- | ------- |
| Database schema (User, Organization, role_and_organization, Job, Comment, Report tables) | `prisma/schema.prisma`             | ✅ done |
| reporting-svc (list reports, get by id, CSV/XLSX/JSON export, delete)                    | `reporting-svc/*`                  | ✅ done |
| MinIO integration for report backups                                                     | `docker-compose.yml` MinIO service | ✅ done |

**Contributed to dashboard (PR #45):**

| What                                                      | File                                            | Status  |
| --------------------------------------------------------- | ----------------------------------------------- | ------- |
| Sentiment chart component (VADER scores by day, Recharts) | `components/dashboard/home/RevenueOverview.tsx` | ✅ done |
| Jobs list in sidebar                                      | `components/dashboard/layout/sidebar.tsx`       | ✅ done |
| React Query hooks for reports                             | `hooks/useReports.ts`, `useReportById.ts`, etc. | ✅ done |
| HTTP calls for reporting API (list, get, export, delete)  | `lib/api/organizationReports.ts` etc.           | ✅ done |

---

## 3. What the Eval Sheet Says You Need (and Current Status)

### Modules — Status per claim

| Module                                  | Points              | Owner            | Status                                                 |
| --------------------------------------- | ------------------- | ---------------- | ------------------------------------------------------ |
| **RAG (AI)** — major                    | 2pt                 | Youssef          | ✅ `POST /rag/query` works end-to-end with citations   |
| **Sentiment Analysis** — minor          | 1pt                 | Youssef          | ✅ VADER + TextBlob on every comment                   |
| **JWT Authentication** — major          | 2pt                 | Mehdi            | ✅ argon2 + JWT + denylist + 42 OAuth                  |
| **WAF / ModSecurity** — major           | 2pt                 | Madani           | ✅ nginx CRS running, blocks SQLi / disallowed methods |
| **Microservices / API Gateway** — major | 2pt                 | Youssef + Madani | ✅ gateway-svc + nginx routing                         |
| **BullMQ Job Queue** — minor            | 1pt                 | Youssef + Madani | ✅ scrape-job → analyze-job pipeline                   |
| **HashiCorp Vault** — minor             | 1pt                 | Madani           | ⚠️ Seeded but **no service reads from Vault yet**      |
| **Reporting / Export** — minor          | 1pt                 | Oussama          | ✅ CSV/XLSX/JSON export works                          |
| **Dashboard / Analytics** — major       | 2pt                 | Hamza + Oussama  | ✅ SWOT, sentiment chart, job counters, reports        |
| **pgvector / Embeddings**               | (part of RAG)       | Youssef          | ✅ 384-dim MiniLM, cosine `<=>` query                  |
| **MinIO object storage**                | (part of reporting) | Oussama          | ✅ running, reporting uses it                          |
| **Members / Org management** — minor    | 1pt                 | Mehdi + Hamza    | ✅ invite, role change, remove                         |
| **42 OAuth** — minor                    | 1pt                 | Mehdi            | ✅ flow implemented                                    |

**Minimum to pass evaluation: 14 module points.** Running total above: ~16–17pt if Vault gap is closed.

---

## 4. What's Still Missing / Broken

### 🔴 Critical — blocks eval points

| Gap                                                                                                                                                                                  | What it means                                                                                                                  | Who fixes it                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| **HTTPS not active** — eval sheet checks for HTTPS on all connections                                                                                                                | nginx is on HTTP only. Evaluators will check the browser address bar. Need a self-signed cert + `listen 443 ssl` in nginx.conf | Madani (nginx)                         |
| **Privacy Policy + Terms of Service pages** — eval sheet rejects without them                                                                                                        | The app needs accessible `/privacy` and `/terms` pages with real content                                                       | Hamza (frontend pages)                 |
| **README incomplete** — eval sheet checks for: project name, team roles, tech justifications, DB schema, feature list with owners, modules with point calc, individual contributions | Current README unknown — need to verify it has all 8 required sections                                                         | Everyone (1 person writes, all verify) |

### 🟡 Important — loses points or credibility

| Gap                                                                              | What it means                                                                                                                                                                      | Who fixes it                                                                |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Vault: services don't read secrets from it**                                   | Evaluator will ask "show me a service reading from Vault". Vault is seeded but nothing uses it — this is explicitly called out in the study doc as "not validating the module yet" | Madani (1 service needs to call `vault kv get`)                             |
| **Token denylist gap (Y3)**                                                      | After `POST /api/auth/logout`, `GET /api/jobs` still returns 200. gateway-svc doesn't check auth-svc's denylist. Mehdi's logout works for auth routes, not for gateway routes      | Youssef (gateway JwtAuthGuard calls `/auth/verify`) or Mehdi (Redis notify) |
| **`new-scrape-form` components unused**                                          | `components/new-job/new-scrape-form.tsx` exists but is imported nowhere — dead code, evaluator will find it with grep                                                              | Hamza: wire it or delete it                                                 |
| **Chrome console errors** — eval sheet opens DevTools and checks                 | Any React warnings, missing key props, type errors in console will be flagged                                                                                                      | Everyone: `open DevTools → Console → check before demo`                     |
| **Grafana/Prometheus not configured** — services are up but dashboards are empty | If monitoring is claimed as a module, dashboards need actual data scraped from services                                                                                            | Hamza                                                                       |

### 🟢 Minor — polish, won't fail eval but evaluators notice

| Gap                                                     | What to do                                                                                                    |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Swagger docs not verified post-integration              | `docker compose exec gateway-svc curl http://localhost:3001/api` — check all new routes appear                |
| `stack-test@example.com` test user needs to exist in DB | If evaluator uses the seed creds and they don't exist, the smoke test fails                                   |
| analysis-svc: `skills/*.md` prompts in container        | Verify `docker compose exec analysis-svc ls /app/skills/` — needs those 5 files present                       |
| Load test never done                                    | Not required for eval but W7 milestone said to do one. `k6` or `autocannon` for 10 concurrent job submissions |
| `main` branch not updated                               | Per `NOTE.md`: W8 milestone sync (`dev → main`) due Oct 18. Need a clean `main` for evaluation day            |

---

## 5. Your W5–W8 Milestone Map vs Reality

| Planned Milestone                                       | Planned Date    | Reality                                 |
| ------------------------------------------------------- | --------------- | --------------------------------------- |
| W5: RAG endpoint + SWOT + sentiment + pgvector complete | Aug 31–Sep 6    | ✅ Done (shipped Oct 8–11 compressed)   |
| W6: Frontend consumes real endpoints, Swagger polish    | Sep 7–13        | ✅ Done (Hamza wired in PR #45, Oct 14) |
| W7: WAF coexistence tested, load test done              | Sep 14–20       | ✅ WAF is live. ❌ Load test not done.  |
| W7 milestone sync (`dev → main`)                        | Oct 11          | ❌ Not done — `main` is still old       |
| W8: Demo rehearsal, README, whiteboard ready            | Now (Oct 15–18) | 🟡 In progress                          |
| W8 milestone sync (`dev → main`)                        | Oct 18          | 🔴 Must happen before evaluation        |

---

## 6. The Pre-Eval Checklist (Team)

**Assign one owner per item. Target: done by Oct 18.**

```
[ ] Madani — add HTTPS (self-signed cert) to nginx, update nginx.conf
[ ] Hamza  — add /privacy and /terms pages (any content is fine, evaluators check existence)
[ ] Everyone — write/verify README.md: all 8 required sections (see eval sheet)
[ ] Madani — wire at least 1 service to read a secret from Vault at startup
[ ] Youssef — fix Y3 logout gap in gateway JwtAuthGuard (call /auth/verify or Redis denylist)
[ ] Hamza  — delete or wire new-scrape-form components
[ ] Everyone — open Chrome DevTools on the live app, clear console errors
[ ] Everyone — verify stack-test@example.com user exists in prod DB (seed it if not)
[ ] Madani/Hamza — verify Grafana dashboards show real data if monitoring is a claimed module
[ ] Everyone — git checkout main && git merge dev && git push origin main (W8 sync)
[ ] Everyone — full team demo rehearsal run-through (you present your part, time it)
```
