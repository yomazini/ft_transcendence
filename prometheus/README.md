# Monitoring — Prometheus + Grafana (owner: Mehdi)

| What | URL | Login |
|---|---|---|
| Grafana | https://grafana.localhost:8080 | `admin` / `GRAFANA_ADMIN_PASSWORD` from `.env` |
| Alerts | https://grafana.localhost:8080/alerting/list (and the *Alerts* panel on *Monitoring health*) | same |
| Prometheus | not published: only Grafana reaches it inside `ft_network` | none |

- **Scraped every 15 s** (`prometheus.yml`): the 5 services (`/metrics`), postgres-exporter,
  redis-exporter, node-exporter, and Prometheus itself.
- **Dashboards**: `grafana/dashboards/*.json` (classic format), loaded at start by
  `grafana/provisioning/`. Folder *ft_transcendence* in Grafana.
- **Alert rules**: `alerts.yml` — ServiceDown, HighErrorRate, ManyFailedLogins,
  HighMemoryUsage, PostgresTooManyConnections.
- **Grafana access**: login required, no anonymous access, no sign-up, password from `.env`.
  Prometheus has no login, so it has no published port.

## Demo an alert

1. `docker stop auth-svc`
2. ~1 minute later, `ServiceDown` is `firing` in Grafana → Alerting → Alert rules (or the *Alerts* panel)
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
