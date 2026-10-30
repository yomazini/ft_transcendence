
#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

echo "Checking dependencies..."
SVCS="reporting-svc auth-svc nginx frontend gateway-svc scraper-svc analysis-svc redis prometheus grafana postgres-exporter redis-exporter stripe-mock"
docker compose up -d --wait vault minio postgres

echo "Stopping reporting service..."
docker compose stop $SVCS

echo "Running restore service..."

if docker compose run --rm --no-deps restore-svc; then
    echo "Recovery succeeded."
else
    echo "Recovery failed."
    echo "Reporting service remains stopped."
    exit 1
fi

echo "Starting reporting service..."
docker compose start $SVCS

echo "Done."
