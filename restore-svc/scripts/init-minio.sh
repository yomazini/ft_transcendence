#!/bin/sh
set -eu
umask 077

echo "Initializing MinIO..."

: "${MINIO_BUCKET_NAME:?MINIO_BUCKET_NAME is required}"

TOKEN=$(curl -fsS -X POST -H "Content-Type: application/json" --data-binary @/tmp/minio-vault/login.json http://vault:8200/v1/auth/approle/login | jq -er '.auth.client_token')

JSON=$(curl -fsS -H "X-Vault-Token: $TOKEN" http://vault:8200/v1/secret/data/minio)

MINIO_ROOT_USER=$(printf '%s' "$JSON" | jq -er '.data.data.user')
MINIO_ROOT_PASSWORD=$(printf '%s' "$JSON" | jq -er '.data.data.password')

MINIO_ACCESS_KEY=$(printf '%s' "$JSON" | jq -er '.data.data.access_key')
MINIO_SECRET_KEY=$(printf '%s' "$JSON" | jq -er '.data.data.secret_key')

unset TOKEN JSON

mc alias set local http://minio:9000/ "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"

if mc admin user svcacct info local "$MINIO_ACCESS_KEY"; then
    echo "Service account already exists"
else
    echo "Creating service account..."

    mc admin user svcacct add local --access-key "$MINIO_ACCESS_KEY" --secret-key "$MINIO_SECRET_KEY" "$MINIO_ROOT_USER"

fi
mc mb --ignore-existing "local/$MINIO_BUCKET_NAME"

mc alias set app http://127.0.0.1:9000 "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY"

mc ls "app/$MINIO_BUCKET_NAME"

mc ilm rule add "local/$MINIO_BUCKET_NAME" --expire-days 30

mc ilm rule ls "local/$MINIO_BUCKET_NAME"

echo "minio is done !!!!!!!!!!!!!!!!!!!!"

