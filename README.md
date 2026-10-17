_This project has been created as part of the 42 curriculum by drari kola i7ot user dialo hh ._

# ft_transcendence — Groundswell

A multi-tenant social-intelligence SaaS: submit a keyword or subreddit,
get back sentiment-scored, SWOT/Blue-Ocean-synthesized market intelligence,
with a live dashboard and a real RAG follow-up question feature.

## Instructions

Prerequisites: Docker, Docker Compose. Copy `.env.example` to `.env` and
fill in real values, then:

```
docker compose up
```

Frontend at `http://localhost:8080`. See `contracts/openapi.yaml` for the API.

## Team

| Dev     | Owns                                                                  |
| ------- | --------------------------------------------------------------------- |
| Hamza   | Frontend, Docker/CI, Prometheus + Grafana                             |
| Mehdi   | auth-svc , devops with hamza 'will be edited by mehdi or hamza later' |
| Madani  | scraper-svc, WAF/Vault                                                |
| Youssef | gateway-svc, analysis-svc                                             |
| Oussama | reporting-svc, database ownership                                     |

## Resources

See `docs/subject.pdf` and `docs/evalsheet.pdf`. AI usage: also will be added later; see DECISIONS.md
for where and why AI tools were used during planning and implementation. later also 
