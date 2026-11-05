#!/bin/sh

pnpm exec prisma migrate deploy

exec node /app/dist/src/main.js
