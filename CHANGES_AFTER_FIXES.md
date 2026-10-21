# Changes after `youssef_local_work` review

This file explains the fixes made after the branch review: what changed, why, and what could break.

## 1) nginx: resolve upstreams at request time
**Why:** nginx resolved `frontend`, `gateway-svc`, etc. at startup. If a container was recreated with a new IP, nginx kept the old IP and returned **502 Bad Gateway**.
**What changed:** `proxy_pass` uses variables (`$frontend_upstream`, `$gateway_upstream`, …), so DNS is resolved per request.
**Could break:** if a service name changes, the matching `set` variable must change too.
**Tested:** frontend and `/api/health` return 200 after recreating containers.

## 2) nginx: preserve report id in `/api/reporting/<id>`
**Why:** with a variable in `proxy_pass`, nginx did not append the remaining URI. `/api/reporting/<id>` became `/reporting/` and returned the job list instead of the report.
**What changed:** `rewrite ^/api/reporting/(.*)$ /reporting/$1 break;` before `proxy_pass`.
**Could break:** if the reporting route prefix changes, the rewrite must change too.
**Tested:** `/api/reporting/<job_id>` returns `swot`, `blue_ocean`, and `conclusion`.

## 3) nginx: allow Socket.IO polling through ModSecurity
**Why:** Socket.IO polling uses `Content-Type: text/plain`, which OWASP rule **920420** blocks with 403.
**What changed:** `modsecurity_rules 'SecRuleRemoveById 920420';` only in `/socket.io/`.
**Could break:** that one WAF rule is no longer applied to Socket.IO; all other rules still are.
**Tested:** job status updates work in the browser console.

## 4) nginx: drop root/chown from Dockerfile
**Why:** `USER root` + `chown` caused restart loops on rootless Docker in the 42 cluster. The base image already runs as `nginx`.
**What changed:** kept `USER nginx`, removed root/chown.
**Could break:** if a future base image needs writable template directories, permissions may need revisiting.
**Tested:** nginx rebuilds, starts healthy, `/healthz` returns 200.

## 5) gateway: restore shared `pnpm-workspace.yaml`
**Why:** the committed file had `/goinfre/ymazini/...` (fails on other machines) and `dangerouslyAllowAllBuilds: true` (supply-chain risk).
**What changed:** restored `dev`’s version with only the 3 allowed build packages.
**Could break:** packages that relied on install scripts will no longer run them unless listed.
**Tested:** `pnpm install --frozen-lockfile` succeeds.

## 6) gateway: reproducible Docker build
**Why:** `pnpm@latest`, no lockfile in the image, and `--no-frozen-lockfile` made builds non-reproducible.
**What changed:** pinned `pnpm@11.24.0`, copied `package.json` + `pnpm-lock.yaml` + `pnpm-workspace.yaml`, used `--frozen-lockfile`, added `NODE_ENV=production`.
**Could break:** if the lockfile is out of date, the build now fails on purpose.
**Tested:** `docker compose build --no-cache gateway-svc` succeeds.

## 7) gateway: disable demo seed in production
**Why:** `seedDefaultStubData()` injected a fake “Done” job for org `018f2d90-...`.
**What changed:** early return when `NODE_ENV === 'production'`.
**Could break:** nothing in production; tests and local dev still seed.
**Tested:** production container returns `null` for the demo job id; gateway tests pass 6/6.

## 8) analysis: fake scraper can target a specific org/user
**Why:** `fake_scraper.py` always used the first org/user, so seeded jobs did not appear for the intended user.
**What changed:** optional `SEED_ORG_ID` / `SEED_USER_ID` env vars; otherwise it still picks the first org/user.
**Could break:** if only one of the two env vars is set, it falls back to the first org/user.
**Tested:** seeded a job for `youssef_org@gmail.com` and it appeared via `/api/jobs`.

## 9) frontend: render object SWOT/Blue Ocean items
**Why:** reports return items like `{point, cited_comment_ids}` and `{action, ...}`, but the UI rendered them directly, causing “Objects are not valid as a React child”.
**What changed:** `swot-cards.tsx` renders `point`, `action`, `text`, or plain strings safely.
**Could break:** no known break; unknown object shapes fall back to `JSON.stringify`.
**Tested:** report page loads with object items.

## Notes on things not changed
- Metrics issues are already tracked separately.
- Frontend message-widget issues were intentionally ignored for now.
- `my_issues.md` and `youssef-branch-review.md` are working documents and are not part of these commits.
