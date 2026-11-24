#!/bin/bash

set -euo pipefail

ENV_FILE=".env"
SECRET=""

echo "[+] Getting Stripe webhook secret..."

for i in {1..30}; do
    SECRET=$(docker compose logs --no-color stripe-cli 2>&1 \
        | grep -oE 'whsec_[a-zA-Z0-9]+' \
        | tail -n 1 || true)

    if [ -n "$SECRET" ]; then
        break
    fi

    sleep 2
done

if [ -z "$SECRET" ]; then
    echo "[-] Stripe webhook secret not found"
    exit 1
fi

touch "$ENV_FILE"

if grep -q '^SECRET_STRIP_WEBHOOKS=' "$ENV_FILE"; then
    sed -i "s/^SECRET_STRIP_WEBHOOKS=.*/SECRET_STRIP_WEBHOOKS=$SECRET/" "$ENV_FILE"
else
    printf '\nSECRET_STRIP_WEBHOOKS=%s\n' "$SECRET" >> "$ENV_FILE"
fi

docker compose exec reporting-svc pnpm exec prisma db push
echo "[+] Stripe webhook secret saved successfully"