#!/bin/sh
set -eu

echo "Fetching PostgreSQL credentials from Vault..."

TOKEN=$(curl -fsS -X POST -H "Content-Type: application/json" --data-binary @/run/vault/login.json http://vault:8200/v1/auth/approle/login | jq -er '.auth.client_token')

JSON=$(curl -fsS -H "X-Vault-Token: $TOKEN" http://vault:8200/v1/secret/data/database)

echo "Extracting PostgreSQL credentials..."

POSTGRES_USER=$(echo "$JSON" | jq -er '.data.data.user')
POSTGRES_PASSWORD=$(echo "$JSON" | jq -er '.data.data.password')
POSTGRES_DB=$(echo "$JSON" | jq -er '.data.data.database')

unset TOKEN JSON

echo "Exporting environment variables..."

export POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB

printf '%s\n' "$POSTGRES_USER" > /tmp/postgres-health-user
printf '%s\n' "$POSTGRES_DB" > /tmp/postgres-health-db

chmod 644 /tmp/postgres-health-user /tmp/postgres-health-db

echo "Starting PostgreSQL..."

./start-postgres.sh &

exec /usr/local/bin/docker-entrypoint.sh "$@"

