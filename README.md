_This project has been created as part of the 42 curriculum by ymazini, eel-garo, osouadi, ebabkran, hkhairi._

# InsightFlow: social intelligence for small teams

## Description

**InsightFlow** changes public Reddit discussions into market insight. A founder types a subreddit, a keyword, a post or a user. The platform collects the comment threads and gives a sentiment score to each comment. It keeps the comments as vectors and sends the most relevant comments to an LLM. The LLM writes a **SWOT analysis** and a **Blue Ocean** strategy canvas. The founder can then **ask questions** about the data (RAG). The answers cite the original comments.

**Goal:** give solo founders and small teams fast customer research ("what do customers really say?") at a low cost.

**Key features**

- Multi-tenant **organizations** with roles (Admin / Analyst / Viewer) and email invitations.
- Email + password signup, **42 OAuth** login, **2FA (TOTP)**, password reset, change of email and password, GDPR export and account deletion.
- **Jobs**: collect Reddit data by keyword, subreddit, post or user. The job status updates live in the browser (WebSocket).
- **Analysis**: VADER sentiment score for each comment, and an average sentiment score for each report. 384-dimension embeddings in PostgreSQL (`pgvector`). The LLM writes the SWOT and Blue Ocean reports.
- **RAG chat**: ask questions about the comments of a job. The answers cite their sources.
- **Analytics dashboard**: charts, date range and sentiment filters, live updates, report viewer, **CSV / XLSX / JSON export**.
- **Paid plans**: demo checkout with `stripe-mock` (no real money). The plan limits the number of members.
- **Public API** with an API key for each organization.
- Security: ModSecurity **WAF**, HashiCorp **Vault** for secrets, data isolation for each organization, HTTPS only.
- Operations: **Prometheus + Grafana** (8 dashboards, 5 alert rules), **status page** (Gatus), daily database **backups** to MinIO and a **restore procedure**.

## Instructions

### Prerequisites

| Tool | Version | Check |
|---|---|---|
| Docker Engine | 24+ (rootless works, for example on 42 machines) | `docker --version` |
| Docker Compose | v2 (`docker compose`) | `docker compose version` |
| GNU Make | any | `make --version` |
| OpenSSL | any version that supports the `openssl` commands in the `Makefile` | `openssl version` |
| Google Chrome | latest stable | — |

`make up` uses OpenSSL to make a self-signed certificate in `nginx/cert/` if none exists.

### Setup

```bash
git clone <repo-url> ft_transcendence && cd ft_transcendence
cp .env.example .env
```

Fill `.env`. Every `changeme` must get a real value.

| Variable | What |
|---|---|
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DATABASE_URL` | database credentials and the connection string for the services |
| `JWT_SECRET` | a random value, for example `openssl rand -hex 32` |
| `FORTYTWO_CLIENT_ID`, `FORTYTWO_CLIENT_SECRET` | from your 42 intra API application |
| `FORTYTWO_CALLBACK_URL`, `FRONTEND_URL` | `https://localhost:8080/api/auth/42/callback`, `https://localhost:8080` |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` | Mailtrap sandbox SMTP |
| `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_FALLBACK_MODELS` | LLM access (optional: without a key, the service writes a built-in report) |
| `REDDIT_SESSIONS` | Reddit session values for the scraper |
| `STRIPE_SECRET_KEY` | `sk_test_mock` (key for the local `stripe-mock`) |
| `GRAFANA_ADMIN_PASSWORD`, `MINIO_ROOT_*`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `BACKUP_HMAC_KEY` | admin passwords and backup keys |
| `HTTP_PORT` | site port, default `8080` |

`.env` is ignored by git. At start, Vault keeps these secrets, and the services read them from Vault.

### Run

```bash
make up          # make the certificate if necessary, then build and start everything
make ps          # every container must be Up / healthy
```

| URL | What |
|---|---|
| https://localhost:8080 | the application |
| https://localhost:8080/api/docs | API documentation (Swagger) |
| https://grafana.localhost:8080 | Grafana (admin / `GRAFANA_ADMIN_PASSWORD`) |
| https://status.localhost:8080 | status page (Gatus) |

The certificate is self-signed. Chrome shows a warning one time: click **Advanced → Proceed**.

Other commands: `make down` (stop, keep the data) · `make clean` (stop and delete all data) · `make cleardb` (empty the database) · `make logs s=<service>` · `make exec s=<service>` · `make recover` (restore the database from a backup, see `restore-svc/README_database_recovery.md`).

## Team Information

| Member | Login | Role(s) | Responsibilities |
|---|---|---|---|
| Youssef Mazini | yomazini | Tech Lead, Developer, PO | architecture and API contract, gateway-svc, analysis-svc (AI pipeline, RAG), Redis / BullMQ |
| El Mehdi El Garouaz | eel-garo | Developer, PM | auth-svc (accounts, organizations, roles, 42 OAuth, 2FA, GDPR), auth pages, Prometheus + Grafana, integration |
| Ossama Souadi | osouadi | Developer | database schema and migrations, reporting-svc, analytics dashboard, exports, backups and restore, status page |
| Elmadani Babkrani | ebabkran | Developer | scraper-svc, nginx + ModSecurity WAF, TLS, Vault |
| Hamza Khairi | hkhairi | Developer | frontend base and layout, billing, API key page, legal pages, CI |

## Project Management

- **Organization:** one owner for each service (table above). We started with 2 weeks of learning and planning (July 2026). The first commit is from 2026-08-06. The build took more time than the 8 weeks in our first plan; it continued until November 2026. We had integration days when services had to work together.
- **Tasks:** GitHub Issues (one issue for each feature or fix, assigned to its owner), feature branches, pull requests into `dev` (the branch is protected: a PR and the Gitleaks check are necessary).
- **Reviews:** a teammate reviews each PR before the merge.
- **Git history:** each member commits their own work on their own branches. Commit messages use `type(scope): message` (for example `feat(auth): …`, `fix(compose): …`).
- **Communication:** Discord server (daily messages, screenshots of problems, PR links).
- **Docs:** shared OpenAPI contract (`contracts/openapi.yaml`).

## Technical Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js (React, TypeScript), Tailwind CSS, shadcn/ui, Recharts, TanStack Query, Socket.IO client | a component framework and fast styling; Query keeps API data in a cache; Socket.IO gives live job status |
| Entry point | nginx + ModSecurity (OWASP CRS), TLS | one entry point, HTTPS, a WAF against injections, security headers |
| Gateway | NestJS | authentication check, rate limit, WebSocket relay, job queue producer, API keys |
| Auth | NestJS, Passport (JWT, 42 OAuth), argon2, otplib (TOTP), Prisma | modules and guards; argon2 is a modern password hash |
| Reporting | NestJS, Prisma | aggregations, exports, scheduled backups |
| Scraper | Python, BullMQ worker | Python is good for scraping; the queue keeps it separate from the API |
| Analysis | FastAPI, VADER, sentence-transformers, OpenRouter LLM | local sentiment and embeddings; the LLM is used only for the synthesis |
| Database | **PostgreSQL + pgvector** | relational data **and** vector search in one database, with filters for each organization |
| Queue / cache | Redis (BullMQ, pub/sub) | async jobs between services, live events |
| Secrets | HashiCorp Vault (AppRole for each service) | no secrets in code or images; each service reads only its own secrets |
| Observability | Prometheus, Grafana, postgres / redis / node exporters | metrics, dashboards, alerts |
| Status page | Gatus | health of every service on one page |
| Storage | MinIO | database backups |
| Payments | `stripe-mock` (official Stripe API mock) + the Stripe Node library | demo of paid plans with the real Stripe API shape and no real money |
| Delivery | Docker Compose, Make, GitHub Actions (Gitleaks, Docker build) | start with one command; CI checks for secrets and builds the images |

**Why microservices:** each member owns one service from start to end. Python is good for scraping and AI; NestJS is good for the API.
**Why one PostgreSQL:** relations (users, organizations, jobs) and vectors (RAG) are in the same transactions and filters.

## Database Schema

```
Organization 1 ──< role_and_organization 1 ── 1 User      (role: Admin | Analyst | Viewer; one organization per user)
Organization 1 ──  0..1 ApiKey ── 1 User                 (one API key per organization)
Organization 1 ──< Subscription 1 ──< Payment             (plan: Free | Premium | Extra)
Organization 1 ──< Job
Job          1 ──< SubJob                                (pages of one scraping run)
Job          1 ──< Comments ──< Comments (replies)       (text, upvotes, sentiment_score, embedding vector(384))
Job          1 ──< Report                                (swot JSON, blue_ocean JSON, sentiment_score)
Backups                                                  (backup files and their status)
```

| Table | Key fields (type) |
|---|---|
| `Organization` | `id` (uuid), `name` (text), `description` (varchar 200), `created_at` |
| `User` | `id` (uuid), `email` (unique), `password` (argon2 hash), `two_factor_secret?`, `is_2fa_enabled`, `created_at` |
| `role_and_organization` | `id`, `user_id` (**unique**: a user is in one organization), `org_id`, `role` (enum) |
| `ApiKey` | `id`, `org_id` (unique), `user_id` (unique), `key_hash` (unique), `prefix`, `label?`, `active`, `created_at`, `last_used_at?`, `revoked_at?` |
| `Subscription` | `id`, `org_id`, `plan` (enum), `status` (Active / Canceled / Expired), `started_at`, `ends_at`, `cancel_at_period_end` |
| `Payment` | `id`, `org_id`, `subscription_id?`, `plan`, `amount_cents` (int), `currency`, `status` (Pending / Succeeded / Failed), `idempotency_key?` (unique), `provider_reference?` (unique) |
| `Job` | `id`, `org_id`, `name`, `target`, `mode` (Keyword / Subreddit / Post / User), `status` (Queued / Scraping / Running / Done / Failed), `updatable` (bool), `customer_persona?` (JSON), `created_at` |
| `SubJob` | `id`, `job_id`, `next_id?` (unique), `url`, `data?` (JSON), `created_at` |
| `Comments` | `id`, `job_id`, `reddit_id`, `hash` (varchar 64), `text`, `author?`, `upvotes` (int), `sentiment_score?` (float), `parent_id?`, `embedding?` (pgvector), `created_at`, `updated_at` |
| `Report` | `id`, `job_id`, `swot` (JSON), `blue_ocean` (JSON), `sentiment_score?` (float), `conclusion?`, `created_at` |
| `Backups` | `id`, `fileName`, `filePath`, `s3Key?`, `fileSize?`, `status` (IN_PROGRESS / SUCCESS / FAILED / RESTORED), `errorMessage?`, `created_at` |

When an organization is deleted, its memberships, API key, subscriptions, payments, jobs, sub-jobs, comments and reports are also deleted (cascade). Every query on organization data uses the `org_id` from the verified token, never from the request.

## Features List

| Feature | What it does | Who |
|---|---|---|
| Signup / login / logout | email + password (argon2), JWT for 1 h, logout ends every session of the user | Mehdi |
| 42 OAuth | login with the 42 intra; the first login asks for an organization and a password | Mehdi |
| 2FA (TOTP) | enable with a QR code, code at login, disable with a code | Mehdi |
| Organizations and members | create at signup, edit, delete, invite by email, change roles, remove members | Mehdi |
| Account settings | change password, change email (the current password is necessary) | Mehdi |
| Password reset | email link | Mehdi |
| GDPR | export my data, delete my account, confirmation emails | Mehdi |
| Auth pages | login, register, 2FA, reset, invite, 42 completion | Mehdi |
| API gateway | one API entry, JWT and API key check, rate limit, proxy to auth | Youssef |
| Jobs and live status | create jobs; the status goes over WebSocket only to the organization | Youssef, Madani |
| Reddit scraper | 4 modes (keyword, subreddit, post, user), sub-jobs, retries | Madani |
| Analysis pipeline | sentiment, embeddings, SWOT and Blue Ocean with the LLM | Youssef |
| RAG chat | questions about the comments of a job, answers with citations | Youssef |
| Analytics dashboard and reports | charts, date range and sentiment filters, SWOT cards, report viewer | Ossama |
| Export | report as CSV, XLSX, JSON | Ossama |
| Backups and restore | daily `pg_dump` signed with HMAC, kept in MinIO; `make recover` restores a backup | Ossama |
| Status page | Gatus checks every service | Ossama |
| WAF and TLS | ModSecurity + OWASP rules in nginx, HTTPS, security headers | Madani |
| Secrets | Vault production mode, AppRole for each service | Madani |
| Monitoring | Prometheus, exporters, 8 Grafana dashboards, 5 alert rules | Mehdi (`/metrics` in each service: its owner) |
| API documentation | Swagger UI | Mehdi, Youssef |
| API keys | an Admin makes or revokes the API key of the organization | Hamza (page), Youssef (gateway), Mehdi (auth) |
| Billing | Free / Premium / Extra plans, checkout with `stripe-mock`, payment history, cancel; Admin only; the member limit is checked at invite | Hamza (feature), Mehdi (integration, limits) |
| Privacy Policy, Terms of Service | public pages, links in the footer, a checkbox at signup | Hamza |

## Modules

### Claimed modules

| Module (subject words) | Type | Pts | Why we chose it | How we made it | Who |
|---|---|---|---|---|---|
| Use a framework for both the frontend and backend | Major | 2 | the product needs a rich UI and many APIs | Next.js; NestJS + FastAPI | all |
| Backend as microservices | Major | 2 | one owner for each service; Python for AI and scraping | 5 services + gateway, REST + Redis queues, one responsibility each | all |
| An organization system | Major | 2 | B2B tool: data belongs to a workspace | create / edit / delete organization, add / remove members, isolation for each organization | Mehdi |
| Advanced permissions system | Major | 2 | some users run jobs, other users only read | Admin / Analyst / Viewer, user CRUD by Admin, guards, UI changes for each role | Mehdi |
| Real-time features (WebSockets) | Major | 2 | the job status changes while the user looks | Socket.IO, Redis pub/sub, a room for each organization, reconnection | Youssef |
| Complete RAG system | Major | 2 | main feature: ask questions about the collected data | pgvector similarity search + LLM answers with citations | Youssef |
| WAF / ModSecurity (hardened) + HashiCorp Vault | Major | 2 | public entry point and many API keys | nginx ModSecurity CRS; Vault AppRole and a policy for each service | Madani |
| Monitoring system with Prometheus and Grafana | Major | 2 | 10+ containers to watch | exporters, `/metrics`, provisioned dashboards, alert rules, Grafana login | Mehdi |
| Advanced analytics dashboard with data visualization | Major | 2 | users must see the trends in the data | Recharts line / bar / pie charts, live updates, CSV / XLSX / JSON export, date range and sentiment filters | Ossama |
| Remote authentication with OAuth 2.0 | Minor | 1 | students log in with 42 | Passport 42 strategy | Mehdi |
| Complete 2FA system | Minor | 1 | protect Admin accounts | TOTP (otplib), QR code setup, code at login and at 42 login, disable with a code | Mehdi |
| Use an ORM for the database | Minor | 1 | typed queries, migrations | Prisma (reporting-svc owns the migrations) | Ossama, Mehdi |
| GDPR compliance features | Minor | 1 | users own their data | export my data, delete with password confirmation, confirmation emails | Mehdi |
| Sentiment analysis for user-generated content | Minor | 1 | sentiment trends for each job | VADER on each comment, average for each report | Youssef |
| Health check and status page system with automated backups and disaster recovery | Minor | 1 | the team must see failures and recover data | Gatus status page, Docker health checks, daily backups to MinIO, `make recover` | Ossama |

### Point calculation

| | Count | Points |
|---|---|---|
| Major modules | 9 × 2 | 18 |
| Minor modules | 6 × 1 | 6 |
| **Total claimed** | 15 modules | **24** |
| Necessary to pass | | 14 |
| Bonus (only if the mandatory part is perfect) | 24 − 14 | 10 (max 25) |

**Modules of choice:** none. All modules above are from the subject's list.

## Individual Contributions

- **Youssef**: gateway (routing, JWT and API key check, rate limit, WebSocket rooms, auth proxy), analysis-svc (sentiment, embeddings, LLM synthesis with fallbacks, RAG), BullMQ pipeline, Vault wiring for gateway / analysis, `/metrics` for both. *Challenge:* free LLM models returned 404 / 429 → a list of fallback models and a built-in report.
- **Mehdi**: auth-svc from start to end (signup, login, logout denylist, 42 OAuth, 2FA, organizations, members, invites, roles, password flows, GDPR, Swagger), auth and settings pages, Prometheus + Grafana module, branch integration. *Challenge:* guard order in NestJS (an interceptor did not count 401 errors → a middleware).
- **Ossama**: PostgreSQL schema and migrations (pgvector), reporting-svc (reports, exports, backups with HMAC to MinIO, restore), analytics dashboard and report UI, status page.
- **Madani**: Reddit scraper (4 modes: post, keyword, subreddit, user), nginx + ModSecurity WAF, TLS, Vault production mode (auto-unseal, AppRole and a policy for each service, secret rotation).
- **Hamza**: frontend base (Next.js layout, components, theme), billing with `stripe-mock`, API key page, legal pages.

## Resources

- Subject (`en.subject.pdf`) and evaluation sheet: ft_transcendence project page on the 42 intra.
- NestJS: https://docs.nestjs.com · FastAPI: https://fastapi.tiangolo.com · Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs · PostgreSQL: https://www.postgresql.org/docs/17/ · pgvector: https://github.com/pgvector/pgvector
- BullMQ: https://docs.bullmq.io · Socket.IO: https://socket.io/docs/v4/
- OWASP API Security Top 10: https://owasp.org/API-Security/ · ModSecurity CRS: https://coreruleset.org
- HashiCorp Vault: https://developer.hashicorp.com/vault/docs
- Prometheus: https://prometheus.io/docs · Grafana: https://grafana.com/docs/grafana/latest/ · Gatus: https://github.com/TwiN/gatus
- Stripe API and stripe-mock: https://docs.stripe.com/api · https://github.com/stripe/stripe-mock
- VADER: https://github.com/cjhutto/vaderSentiment · sentence-transformers: https://www.sbert.net

### How AI was used

We used AI as a learning aid: it explained concepts, suggested what to read first, discussed best practices with us and helped us find gaps in our knowledge. This covered NestJS, FastAPI, Prometheus, Vault and Docker.
