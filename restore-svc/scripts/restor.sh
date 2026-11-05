
#!/bin/sh
set -eu
umask 077

# -----------------------------------------
# Configuration
# -----------------------------------------

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

LOGIN_FILE="${LOGIN_FILE:-/run/vault/login.json}"
BACKUP_PATH="${BACKUP_PATH:-/tmp/backups}"

VAULT_ADDR="${VAULT_ADDR:-http://vault:8200}"
MINIO_URL="http://${MINIO_ENDPOINT}:${MINIO_PORT}"
POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

ls $LOGIN_FILE

: "${MINIO_BUCKET_NAME:?MINIO_BUCKET_NAME is required}"

[ -f "$LOGIN_FILE" ] || {
    echo "ERROR: Vault login file not found $LOGIN_FILE"
    exit 1
}

mkdir -p "$BACKUP_PATH"

MC_CONFIG_DIR="$(mktemp -d)"
export MC_CONFIG_DIR

trap 'rm -rf "$MC_CONFIG_DIR"' EXIT
trap 'exit 1' HUP INT TERM

# -----------------------------------------
# 1. Authenticate with Vault
# -----------------------------------------

echo "Authenticating with Vault..."

TOKEN=$(curl -fsS -X POST -H "Content-Type: application/json" --data-binary @"$LOGIN_FILE" "$VAULT_ADDR/v1/auth/approle/login" | jq -er '.auth.client_token')

# -----------------------------------------
# 2. Retrieve secrets
# -----------------------------------------

echo "Retrieving secrets..."

MINJSON=$(curl -fsS \
    -H "X-Vault-Token: $TOKEN" \
    "$VAULT_ADDR/v1/secret/data/minio")

PGJSON=$(curl -fsS \
    -H "X-Vault-Token: $TOKEN" \
    "$VAULT_ADDR/v1/secret/data/database")

MINIO_ACCESS_KEY=$(printf '%s' "$MINJSON" | jq -er '.data.data.access_key')

MINIO_SECRET_KEY=$(printf '%s' "$MINJSON" | jq -er '.data.data.secret_key')


BACKUP_HMAC_KEY=$(printf '%s' "$MINJSON" | jq -er '.data.data.backup_hmac_key')

POSTGRES_USER=$(printf '%s' "$PGJSON" | jq -er '.data.data.user')

POSTGRES_PASSWORD=$(printf '%s' "$PGJSON" | jq -er '.data.data.password')

POSTGRES_DB=$(printf '%s' "$PGJSON" | jq -er '.data.data.database')

unset TOKEN MINJSON PGJSON

# -----------------------------------------
# 3. Connect directly to MinIO
# -----------------------------------------

echo "Connecting to MinIO..."

mc alias set myminio "$MINIO_URL" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" > /dev/null

# -----------------------------------------
# 4. Find latest backup
# -----------------------------------------

echo "Getting backup file name..."

RESULT=$(mc --json ls --recursive "myminio/$MINIO_BUCKET_NAME")

FileName=$(printf '%s\n' "$RESULT" |
    jq -sr '
        map(select((.key // "") | endswith(".dump")))
        | sort_by(.lastModified)
        | last
        | .key // empty
    ')

echo "Latest backup: $FileName"

[ -n "$FileName" ] || {
    echo "ERROR: No backup found"
    exit 1
}

case "$FileName" in
    *[!a-zA-Z0-9._-]*|.|..)
        echo "ERROR: Invalid backup filename"
        exit 1
        ;;
esac

ShaFileName="$FileName.hmac"

echo "Using backup: $FileName"

# -----------------------------------------
# 5. Download files from MinIO
# -----------------------------------------

echo "Downloading backup..."

mc cp "myminio/$MINIO_BUCKET_NAME/$FileName" "$BACKUP_PATH/$FileName"

mc cp "myminio/$MINIO_BUCKET_NAME/$ShaFileName" "$BACKUP_PATH/$ShaFileName"

[ -s "$BACKUP_PATH/$FileName" ] &&
[ -s "$BACKUP_PATH/$ShaFileName" ] || {
    echo "ERROR: Download failed"
    exit 1
}

# -----------------------------------------
# 6. Verify backup integrity
# -----------------------------------------

echo "Verifying integrity..."

EXPECTED=$(awk '{print $1}' \
    "$BACKUP_PATH/$ShaFileName")

ACTUAL=$(openssl dgst \
    -sha256 \
    -hmac "$BACKUP_HMAC_KEY" \
    "$BACKUP_PATH/$FileName" |
    awk '{print $NF}')

case "$EXPECTED" in
    *[!0-9a-fA-F]*|"")
        echo "ERROR: Invalid HMAC format"
        exit 1
        ;;
esac

[ "${#EXPECTED}" -eq 64 ] || {
    echo "ERROR: Invalid HMAC length"
    exit 1
}

[ "$EXPECTED" = "$ACTUAL" ] || {
    echo "INTEGRITY CHECK FAILED - do not restore"
    exit 1
}

echo "Integrity OK"

# -----------------------------------------
# 7. Validate backup archive
# -----------------------------------------

echo "Checking backup format..."

pg_restore --list "$BACKUP_PATH/$FileName" \
    > /dev/null || {
    echo "ERROR: Invalid PostgreSQL archive"
    exit 1
}

# -----------------------------------------
# 8. Connect to PostgreSQL
# -----------------------------------------

echo "Checking PostgreSQL connection..."

export PGPASSWORD="$POSTGRES_PASSWORD"

psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 -c "SELECT 1;" > /dev/null

# -----------------------------------------
# 9. Validate target database
# -----------------------------------------

case "$POSTGRES_DB" in
    ""|postgres|template0|template1)
        echo "ERROR: Unsafe database name"
        exit 1
        ;;
esac

case "$POSTGRES_DB" in
    [a-zA-Z_]*)
        case "$POSTGRES_DB" in
            *[!a-zA-Z0-9_]*)
                echo "ERROR: Unsupported database name"
                exit 1
                ;;
        esac
        ;;
    *)
        echo "ERROR: Unsupported database name"
        exit 1
        ;;
esac

# -----------------------------------------
# 10. Recreate database
# -----------------------------------------

echo "Recreating database..."

psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"$POSTGRES_DB\" WITH (FORCE);"

psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"$POSTGRES_DB\";"

# -----------------------------------------
# 11. Restore database
# -----------------------------------------

echo "Restoring database..."

pg_restore -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --exit-on-error "$BACKUP_PATH/$FileName"

echo "Database restore completed successfully."

unset PGPASSWORD POSTGRES_PASSWORD
unset MINIO_ACCESS_KEY MINIO_SECRET_KEY BACKUP_HMAC_KEY

echo "Done."