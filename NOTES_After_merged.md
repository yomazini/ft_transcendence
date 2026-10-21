
## nginx SecRuleRemoveById 920420
- Disables OWASP CRS rule 920420 only for /socket.io/.
- Rule blocks requests with Content-Type not in allowed list (text/plain).
- Socket.IO polling uses text/plain, so this prevents 403.
- WAF stays active for everything else.

## ModSecurity rule 920420 deep dive
- Rule: "Request content type is not allowed by policy".
- It enforces an allowlist of Content-Types (form, multipart, xml, json).
- Socket.IO polling uses text/plain for its handshake/polling payloads.
- So the WAF blocked legitimate Socket.IO traffic with 403.
- Fix: remove only this rule for /socket.io/, keeping all other WAF protections.

## Excluding 920420 safety
- Only affects /socket.io/ path.
- Allows text/plain payloads there (Socket.IO needs it).
- Other WAF rules still apply.
- Minor risk: attackers can send text/plain to socket.io, but endpoint expects Socket.IO format.
- Better long-term: allow text/plain globally or refine rule.

## Frontend should not call /analyze/*
- Analysis runs automatically via queues (gateway -> scraper -> analysis).
- Frontend only creates job via POST /api/jobs.
- /analyze/* endpoints are test/stub only.
- Owner: Youssef (backend flow), Hamza (frontend job creation only).

## Report not showing in frontend
- Cause: nginx variable proxy_pass dropped the report id, so /api/reporting/<id> returned the job list.
- Fix: rewrite ^/api/reporting/(.*)$ /reporting/$1 break; then proxy_pass without URI.
- Test: GET /api/reporting/<job_id> should return the report object.

## Why the reporting rewrite is needed
- proxy_pass with a variable (e.g. $reporting_upstream) does NOT append the remaining URI.
- So /api/reporting/<id> was sent as /reporting/ (list endpoint), losing the id.
- rewrite strips /api and keeps the id before proxying.

## "Medium" security for Socket.IO
- Don't disable ModSecurity globally.
- Keep WAF on; exclude only rule 920420 on /socket.io/.
- Optional: tune PARANOIA env (1-4); higher = stricter, not "safer" for compatibility.
- Why: Socket.IO polling sends text/plain, which rule 920420 rejects.
<<<<<<< Updated upstream
=======

## Dashboard "This page couldn't load"
- Cause: report SWOT/Blue Ocean items are objects ({point, action, ...}), but Cards rendered them directly.
- React error: objects are not valid as a React child.
- Fix: frontend/components/dashboard/swot-cards.tsx now renders point/action/text or strings.
- Owner: Hamza (frontend).

## GitHub issue for Oussama: report schema mismatch
Title: Report SWOT/Blue Ocean items shape breaks frontend rendering

Body:
What happens:
GET /api/reporting/:job_id returns SWOT and Blue Ocean items as objects, but frontend expects strings.
React crashes with "Objects are not valid as a React child" and dashboard shows "This page couldn't load".

Reproduce:
1. Create/seed a job and wait for status Done.
2. Open its report in the dashboard.
3. Page crashes.

Actual example:
{
  "swot": {
    "strengths": [
      { "point": "Generous free tier...", "cited_comment_ids": ["c7"] }
    ]
  },
  "blue_ocean": {
    "strategy": {
      "raise": [
        { "action": "Improve API docs...", "from_strength_or_opportunity": "..." }
      ]
    }
  }
}

Expected example:
{
  "swot": {
    "strengths": ["Generous free tier..."]
  },
  "blue_ocean": {
    "strategy": {
      "raise": ["Improve API docs..."]
    }
  }
}

Impact:
Report page unusable; SWOT/Blue Ocean cannot render.

Suggested fix:
Normalize items to strings in reporting-svc/analysis-svc, or update the OpenAPI contract and frontend to support object items + citations.

Owner: Oussama (reporting-svc) with Youssef (analysis-svc) if contract changes.
>>>>>>> Stashed changes

## opencode.nvim @diagnostics
- Placeholder that injects LSP diagnostics (errors/warnings/hints) into the prompt.
- Scope: selection/range if any, else current buffer.
- "Explain @diagnostics" asks OpenCode to explain those diagnostics.

## ranking.py L39-L42
- L40 max_upvotes: highest upvote count in retrieved comments (never below 0).
- L41 norm_denom: log1p(max(max_upvotes, 10)) used to normalize upvotes.
- Why max(...,10): avoids dividing by zero / tiny values when all upvotes are 0-1.
- L48 uses it: norm_upvotes = log1p(upvotes) / norm_denom.
- Final score: 0.7 * similarity + 0.3 * norm_upvotes.

## fake_scraper diagnostics
- Line 1 had "uimport" instead of "import".
- That single typo caused all Ruff/Pyright errors (uimport, asyncio undefined, etc.).
- Fix: remove the leading "u".

## Verification (my scope)
- gateway-svc /metrics: 404 (issue exists)
- analysis-svc /metrics: 404 (issue exists)
- Prometheus already scrapes both, so both scrapes fail.
- New personal issue list: my_issues.md
- Key risks found: gateway JWT fail-open, RAG no timeout, job-created-but-not-enqueued, message-widget no abort/no accessibility/no tests.

## Verified issue results
- gateway /metrics: 404; analysis /metrics: 404 (both already have issues).
- Auth-svc down → /api/jobs still 200 (JWT guard fails open).
- Analysis paused → /api/rag/query hangs, no gateway timeout.
- Redis down → POST /api/jobs hangs; job row saved as Queued.
- Message widget: no AbortController; drawer always in DOM with aria-modal; no frontend tests.
- Details + issue titles/bodies: my_issues.md

## llm.py strip_thinking (L31-L33)
- Removes model "thinking" blocks like <think>...</think> from raw LLM output.
- DOTALL makes .*? match across newlines.
- Returns cleaned text with outer whitespace trimmed.

## /api/jobs auth
- Protected by class-level @UseGuards(ThrottlerGuard, JwtAuthGuard).
- @ApiBearerAuth only documents auth; it does not enforce it.
- JwtAuthGuard: reads Bearer token, verifies signature with JWT_SECRET, requires sub+org_id, checks auth-svc /auth/verify revocation.
- Then sets req.user; listJobs uses req.user.org_id.

## Argon2id params
- Code uses argon.hash(password) with library defaults (argon2id, m=64 MiB, t=3, p=4).
- You can override with { type: argon2.argon2id, memoryCost, timeCost, parallelism }.
- Defaults are strong; tune only for load/latency. OWASP baseline: m=19 MiB, t=2, p=1 (or stronger).
- Old hashes still verify because params are stored in the hash string.

## JWT parts + denylist
- JWT = header.payload.signature.
- Last part is the HMAC-SHA256 signature (base64url), not a UUID.
- Denylist stores the FULL token string (all 3 parts) until exp.
- auth-svc logout adds token; /auth/verify and gateway guard reject it.

## Last 2 commits
### a6f64a8 gateway proxy for auth/orgs
- Why: nginx used to send /api/auth and /api/orgs directly to auth-svc.
- What: gateway now forwards those routes to auth-svc via ProxyService.
- Nginx auth/orgs blocks removed; all /api traffic goes through gateway.
- Concepts: reverse proxy, middleware, HTTP forwarding, x-forwarded-* headers.

### 1f7a588 JWT revocation check
- Why: logout must invalidate a token before it expires.
- What: JwtAuthGuard calls auth-svc /auth/verify and rejects revoked/logged-out tokens.
- Concepts: JWT, stateless auth vs denylist, fail-open vs fail-closed, token expiry.

## Message-widget extra issues
- Chat not reset when job changes.
- Empty job still sends RAG request.
- Citation modal lacks Escape/focus trap/aria dialog.
- Added to my_issues.md as 7-9.

## Message-widget issues 1-3 explained
1) No AbortController: closing chat doesn't cancel fetch; late response still updates state.
   Test: slow/pause analysis-svc, send, close, reopen -> answer appears late.
2) Drawer a11y: aside stays in DOM with aria-modal even when closed; no focus trap.
   Test: close drawer, Tab through page; focus can enter hidden chat.
3) No tests: no test script/files; no RTL/Vitest setup.
   Test: find frontend -name '*.test.*' -> none; pnpm test -> missing script.
Issues 4-6 ignored for now.

## Can message-widget issues be ignored?
- Yes for core functionality; none break build/runtime.
- 1 & 5 are minor UX/cleanup.
- 2 & 6 may matter if accessibility is graded.
- 3 matters for maintainability/CI, not runtime.

## Fixes applied (4 issues)
- Restored shared gateway-svc/pnpm-workspace.yaml (no goinfre path, no allow-all builds).
- nginx Dockerfile: removed USER root + chown, kept USER nginx.
- gateway Dockerfile: pnpm 11.24.0, lockfile copied, --frozen-lockfile, NODE_ENV=production.
- database.service.ts: demo seed disabled in production.
Tests: pnpm install OK, no-cache gateway build OK, nginx healthy, gateway tests 6/6, /api/jobs 200.
