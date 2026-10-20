#!/bin/bash

cp -f /config/server.hcl /vault/config/server.hcl

export CREDS_FILE="/vault/credentials.json"

/configuration.sh &

unset REDDIT_SESSIONS POSTGRES_PASSWORD JWT_SECRET FORTYTWO_CLIENT_ID \
	FORTYTWO_CLIENT_SECRET MAIL_PASS GEMINI_API_KEY OPENROUTER_API_KEY \
	GRAFANA_ADMIN_PASSWORD MINIO_ROOT_PASSWORD MINIO_ROOT_USER MAIL_USER \
	POSTGRES_USER

exec /usr/local/bin/docker-entrypoint.sh "$@"
