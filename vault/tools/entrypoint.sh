#!/bin/sh

configure_vault(){

	export VAULT_ADDR="http://127.0.0.1:8200" VAULT_TOKEN="${VAULT_DEV_ROOT_TOKEN_ID}"

	until vault status >/dev/null 2>&1; do
		sleep 1
	done

	echo "Vault is ready"


	echo "Setting up sessions key..."

	vault kv put secret/sessions sessions="$(cat /run/secrets/sessions)"

	vault kv put secret/database \
		username="${POSTGRES_USER}" \
		password="$(cat /run/secrets/db-pass)" \
		host="postgres" \
		port="5432" \
		database="${POSTGRES_DB}"

	vault auth enable approle

	unset VAULT_ADDR VAULT_TOKEN
}

configure_vault &

exec /usr/local/bin/docker-entrypoint.sh "$@"
