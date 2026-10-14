#!/bin/sh
set -e

BACKUP_PATH="/home/osouadi/goinfre/Downloads"
SVCS="reporting-svc"
MINIO=ft-transcendence-minio-1

cd "/home/$USER/goinfre/ft_transcendence/reporting-svc"

set -a
. /home/osouadi/goinfre/ft_transcendence/reporting-svc/.env.example
set +a

echo "Getting backup file name..."
docker exec "$MINIO" sh -c \
  'mc alias set myminio http://localhost:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"' > /dev/null

FileName=$(docker exec "$MINIO" sh -c 'mc ls myminio/min-io-st' \
  | awk '{print $NF}' | grep '\.dump$' | sort | tail -n 1)
[ -n "$FileName" ] || { echo "No backup found"; exit 1; }
ShaFileName="$FileName.hmac"
echo "Using $FileName"

echo "Downloading..."
docker exec \
  -e FileName="$FileName" -e ShaFileName="$ShaFileName" -e BACKUP_PATH="$BACKUP_PATH" \
  "$MINIO" sh -c '
    mc cp "myminio/$MINIO_BUCKET_NAME/$FileName" "myminio/$MINIO_BUCKET_NAME/$ShaFileName" "$BACKUP_PATH"' > /dev/null

[ -s "$BACKUP_PATH/$FileName" ] && [ -s "$BACKUP_PATH/$ShaFileName" ] \
  || { echo "Download failed"; exit 1; }

echo "Verifying integrity..."
EXPECTED=$(awk '{print $1}' "$BACKUP_PATH$ShaFileName")
ACTUAL=$(openssl dgst -sha256 -hmac "$BACKUP_HMAC_KEY" "$BACKUP_PATH/$FileName" | awk '{print $NF}')
[ "$EXPECTED" = "$ACTUAL" ] || { echo "INTEGRITY CHECK FAILED - do not restore"; exit 1; }
echo "Integrity OK"

echo "Stopping apps..."
docker compose stop $SVCS

echo "Recreating database..."
docker compose exec -T postgres psql -U "$POSTGRES_USER" -d postgres -c "DROP DATABASE IF EXISTS \"$POSTGRES_DB\" WITH (FORCE);"
docker compose exec -T postgres psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE \"$POSTGRES_DB\";"

echo "Restoring..."
docker compose exec -T postgres pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  --no-owner --exit-on-error < "$BACKUP_PATH$FileName"

echo "Starting apps..."
docker compose start $SVCS
echo "Done."



