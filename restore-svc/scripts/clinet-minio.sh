#!/bin/sh
set -eu

(
    echo "Waiting for MinIO..."

    until curl -fsS http://127.0.0.1:9000/minio/health/ready >/dev/null; do
        sleep 2
    done

    echo "MinIO is ready"

    /opt/bitnami/scripts/minio/init-minio.sh
) &

exec /opt/bitnami/scripts/minio/run.sh
