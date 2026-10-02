#!/bin/sh

pnpm exec dotenv -e .env.example -- prisma migrate dev

pnpm exec prisma migrate deploy

exec pnpm start:dev