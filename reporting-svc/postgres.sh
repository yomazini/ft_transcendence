#!/bin/sh

pnpm exec prisma migrate deploy

exec pnpm start:dev