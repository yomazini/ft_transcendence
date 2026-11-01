# Scraper Service

## Description

TODO

## Instructions

### Prerequisites

- Docker and Docker Compose installed.
- A `.env` file in the repository root containing the secrets listed below.

### Vault setup

Vault is self-unsealing and seeds its secrets automatically from the `.env` file
on startup. No manual initialization or `vault kv put` is needed.

Set the following variables in `.env`:

| Variable                  | Vault path           | Key        | Description                                       |
| ------------------------- | -------------------- | ---------- | ------------------------------------------------- |
| `<POSTGRES_USER_VAR>`     | `secret/database`    | `user`     | PostgreSQL username                               |
| `<POSTGRES_PASSWORD_VAR>` | `secret/database`    | `password` | PostgreSQL password                               |
| `POSTGRES_DB`             | `secret/database`    | `database` | PostgreSQL database name                          |
| `<REDDIT_SESSIONS_VAR>`   | `secret/scraper-svc` | `sessions` | Reddit session cookies, separated by commas (`,`) |

> **Note:** Seeding is create-only. If a secret already exists in Vault, changing
> its value in `.env` will not overwrite it.

The scraper authenticates to Vault with its own AppRole. Its credentials are written to
`vault/scrape-svc/login.json` and bind-mounted into the container at
`/creds/login.json`.

### Run the service

From the repository root, start (or rebuild) the scraper:

```bash
docker compose up -d --build scraper-svc
```

Follow the logs:

```bash
docker compose logs -f scraper-svc
```

### How it works

1. The scraper consumes jobs from the `scrape-job` Redis queue.
2. It scrapes the Reddit post and its comments, then saves them to PostgreSQL.
3. On success, it forwards the job to the `analyze-job` queue.

> **Note:** Only Reddit post URLs are currently supported.