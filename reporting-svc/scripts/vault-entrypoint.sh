#!/bin/sh
set -eu

echo "Getting MinIO credentials from Vault..."

TOKEN=$(curl -fsS \
  -X POST \
  -H "Content-Type: application/json" \
  --data-binary @/tmp/minio-vault/login.json \
  http://vault:8200/v1/auth/approle/login \
  | jq -er '.auth.client_token')

JSON=$(curl -fsS \
  -H "X-Vault-Token: $TOKEN" \
  http://vault:8200/v1/secret/data/minio)

MINIO_ROOT_USER=$(printf '%s' "$JSON" | jq -er '.data.data.user')
MINIO_ROOT_PASSWORD=$(printf '%s' "$JSON" | jq -er '.data.data.password')
MINIO_ACCESS_KEY=$(printf '%s' "$JSON" |jq -er '.data.data.access_key')
MINIO_SECRET_KEY=$(printf '%s' "$JSON" | jq -er '.data.data.secret_key')


export MINIO_ROOT_USER MINIO_ROOT_PASSWORD

unset TOKEN JSON

rm -f /tmp/minio-vault/login.json

echo "Starting MinIO as UID $(id -u)..."

exec /opt/bitnami/scripts/minio/entrypoint.sh "$@"