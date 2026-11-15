#!/bin/sh

set -e

# cp, not mv: a restart reuses the container's filesystem, where a moved file would be gone.
cp -f /config/server.hcl /vault/config/server.hcl

umask 077

export CREDS_FILE="${CREDS_FILE:-/secret/credentials.json}"
chmod 777 /audit
[ -d /credentials ] && chmod 755 /credentials && chmod -R 755 /credentials 2>/dev/null || true

if [ ! -f "$CREDS_FILE" ]; then
	jq -n '{unseal_key: null, token: null, roles: {}, ready: false}' >"$CREDS_FILE.tmp"
	mv "$CREDS_FILE.tmp" "$CREDS_FILE"
else
	jq '.ready = false' "$CREDS_FILE" > "$CREDS_FILE.tmp"
	mv "$CREDS_FILE.tmp" "$CREDS_FILE"
fi

uv run --project /vault-py --no-sync vault-py &

exec env -i /usr/local/bin/docker-entrypoint.sh "$@"
