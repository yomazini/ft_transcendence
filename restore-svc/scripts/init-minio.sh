
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

MC_CONFIG_DIR=$(mktemp -d)
export MC_CONFIG_DIR
trap 'rm -rf "$MC_CONFIG_DIR"' EXIT

mc alias set admin http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" > /dev/null

has_lifecycle_rule() {
    RULES=$(mc ilm rule ls --json admin/min-io-st 2>/dev/null) || return 1

    printf '%s\n' "$RULES" |
        jq -e '
            .config.Rules[]?
            | select(
                .Status == "Enabled"
                and .Expiration.Days == 30
            )
        ' > /dev/null
}

echo "Checking if MinIO is already initialized..."

if mc admin user info admin "$MINIO_ACCESS_KEY" > /dev/null 2>&1 && mc stat admin/min-io-st > /dev/null 2>&1 && has_lifecycle_rule
then
    mc alias set app http://minio:9000 "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" > /dev/null

    if mc ls app/min-io-st > /dev/null 2>&1; then
        echo "MinIO already initialized. Exiting..."
        exit 0
    fi
fi

echo "Checking application user..."

if mc admin user info admin "$MINIO_ACCESS_KEY" > /dev/null 2>&1; then
    echo "Application user already exists"
else
    echo "Creating application user..."

    mc admin user add admin "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY"
fi

mc admin policy attach admin readwrite \
    --user "$MINIO_ACCESS_KEY"

mc alias set app \
    http://minio:9000 \
    "$MINIO_ACCESS_KEY" \
    "$MINIO_SECRET_KEY" > /dev/null

echo "Checking bucket..."

mc mb --ignore-existing admin/min-io-st

echo "Checking lifecycle rules..."

if has_lifecycle_rule; then
    echo "30-day lifecycle rule already exists"
else
    echo "Adding 30-day lifecycle rule..."
    mc ilm rule add admin/min-io-st --expire-days 30
fi

echo "Verifying application access..."
mc ls app/min-io-st > /dev/null

echo "MinIO initialization completed successfully"
