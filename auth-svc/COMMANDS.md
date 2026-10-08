# auth-svc — commands cheat sheet

All commands run from inside `auth-svc/`.

## Run the server (local, no Docker)

```bash
pnpm run start:dev
```

## Database (scratch Postgres, via docker-compose)

Start just the DB container (detached, keeps running in background):
```bash
docker-compose up -d postgres
```

Stop it:
```bash
docker-compose down
```

## Prisma

| Step | Raw command | pnpm script |
|---|---|---|
| Create tables from schema.prisma (first time / after schema changes) | `npx prisma migrate dev --name init` | `pnpm run db:migrate` |
| Regenerate the typed client only (no table changes) | `npx prisma generate` | `pnpm run db:generate` |
| Open visual table browser (localhost:5555) | `npx prisma studio` | `pnpm run db:studio` |

## Full stack via Docker (both postgres + auth-svc containerized)

```bash
docker-compose up --build
```
Note: before running this, `DATABASE_URL` in `.env.example` must say
`postgres` as the host, not `localhost` (see note in chat about this
tradeoff — flip it back when switching to this mode).

## Just the container, standalone (no DB, just to see it boot)

```bash
docker build -t auth-svc .
docker run -p 3002:3002 auth-svc
```
