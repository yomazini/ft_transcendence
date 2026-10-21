# Monitoring — Prometheus + Grafana (owner: Mehdi)

| What | URL | Login |
|---|---|---|
| Prometheus | http://localhost:9090 (this machine only) | none |
| Targets | http://localhost:9090/targets | |
| Alerts | http://localhost:9090/alerts | |
| Grafana | http://localhost:3030 | `admin` / `GRAFANA_ADMIN_PASSWORD` from `.env` |

- **Scraped every 15 s** (`prometheus.yml`): the 5 services (`/metrics`), postgres-exporter,
  redis-exporter, node-exporter, and Prometheus itself.
- **Dashboards**: `grafana/dashboards/*.json` (classic format), loaded at start by
  `grafana/provisioning/`. Folder *ft_transcendence* in Grafana.
- **Alert rules**: `alerts.yml` — ServiceDown, HighErrorRate, ManyFailedLogins,
  HighMemoryUsage, PostgresTooManyConnections.
- **Grafana access**: login required, no anonymous access, no sign-up, password from `.env`.
  Prometheus has no login, so it is published on `127.0.0.1` only.

## Demo an alert

1. `docker stop auth-svc`
2. ~1 minute later, `ServiceDown` is `firing` on http://localhost:9090/alerts
3. `docker start auth-svc` → it clears

Or: 11 wrong logins → `ManyFailedLogins` fires ~1 minute later.

## Check the config

    docker exec prometheus promtool check config /etc/prometheus/prometheus.yml
    docker exec prometheus promtool check rules /etc/prometheus/alerts.yml

After editing a file: `docker compose restart prometheus` (or `grafana`).

## Add /metrics to a service

Same metric names in every service, so the *Services overview* dashboard works for all:
`http_requests_total{method,route,status}` and `http_request_duration_seconds`.
NestJS reference: `auth-svc/src/metrics/`.
