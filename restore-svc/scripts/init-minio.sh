
#!/bin/sh
set -eu
umask 077

echo "Initializing MinIO..."

TOKEN=$(curl -fsS \
    -X POST \
    -H "Content-Type: application/json" \
    --data-binary @/run/vault/login.json \
    http://vault:8200/v1/auth/approle/login \
    | jq -er '.auth.client_token')

JSON=$(curl -fsS \
    -H "X-Vault-Token: $TOKEN" \
    http://vault:8200/v1/secret/data/minio)

MINIO_ROOT_USER=$(printf '%s' "$JSON" | jq -er '.data.data.user')
MINIO_ROOT_PASSWORD=$(printf '%s' "$JSON" | jq -er '.data.data.password')

MINIO_ACCESS_KEY=$(printf '%s' "$JSON" | jq -er '.data.data.access_key')
MINIO_SECRET_KEY=$(printf '%s' "$JSON" | jq -er '.data.data.secret_key')

unset TOKEN JSON

export MC_CONFIG_DIR="$(mktemp -d)"
trap 'rm -rf "$MC_CONFIG_DIR"' EXIT

mc alias set admin \
    http://minio:9000 \
    "$MINIO_ROOT_USER" \
    "$MINIO_ROOT_PASSWORD" > /dev/null

echo "Checking application user..."

if mc admin user info admin "$MINIO_ACCESS_KEY" > /dev/null 2>&1; then
    echo "Application user already exists"
else
    echo "Creating application user..."

    mc admin user add admin \
        "$MINIO_ACCESS_KEY" \
        "$MINIO_SECRET_KEY"
fi

mc admin policy attach admin readwrite \
    --user "$MINIO_ACCESS_KEY"

mc alias set app \
    http://minio:9000 \
    "$MINIO_ACCESS_KEY" \
    "$MINIO_SECRET_KEY" > /dev/null

mc ls app > /dev/null

echo "MinIO initialization completed successfully"
