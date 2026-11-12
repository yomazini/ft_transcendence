#!/bin/bash

TOKEN=$(curl -fsS -X POST -H "Content-Type: application/json" --data-binary @/run/vault/login.json http://vault:8200/v1/auth/approle/login | jq -er '.auth.client_token')

JSON=$(curl -fsS -H "X-Vault-Token: $TOKEN" http://vault:8200/v1/secret/data/database)

POSTGRES_USER=$(echo "$JSON" | jq -er '.data.data.user')
POSTGRES_DB=$(echo "$JSON" | jq -er '.data.data.database')

until pg_isready -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
	sleep 2
done

export DATABASE_URL=$(echo "$JSON" | jq -er '.data.data.database_url')

echo "mwaahhhhhhhhhhhhhhhhhhhhhhhhhh"

node /app/node_modules/prisma/build/index.js migrate deploy
