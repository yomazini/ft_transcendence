#!/bin/bash

set -e

# cp, not mv: a restart reuses the container's filesystem, where a moved file would be gone.
cp -f /config/server.hcl /vault/config/server.hcl

umask 077

export CREDS_FILE="${CREDS_FILE:-/secret/credentials.json}"

if [[ ! -f "$CREDS_FILE" ]]; then
	jq -n '{unseal_key: null, token: null, roles: {}, ready: false}' >"$CREDS_FILE.tmp"
	mv "$CREDS_FILE.tmp" "$CREDS_FILE"
else
	jq '.ready = false' "$CREDS_FILE" > "$CREDS_FILE.tmp"
	mv "$CREDS_FILE.tmp" "$CREDS_FILE"
fi

/configuration.sh &

unset REDDIT_SESSIONS POSTGRES_PASSWORD JWT_SECRET FORTYTWO_CLIENT_ID \
	FORTYTWO_CLIENT_SECRET MAIL_PASS GEMINI_API_KEY OPENROUTER_API_KEY \
	GRAFANA_ADMIN_PASSWORD MINIO_ROOT_PASSWORD MINIO_ROOT_USER MAIL_USER \
	POSTGRES_USER

exec /usr/local/bin/docker-entrypoint.sh "$@"
