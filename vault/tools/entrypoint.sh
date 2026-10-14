#!/bin/sh

configure_vault(){

	export VAULT_ADDR="http://127.0.0.1:8200" VAULT_TOKEN="${VAULT_DEV_ROOT_TOKEN_ID}"

	until vault status >/dev/null 2>&1; do
		sleep 1
	done

	echo "Vault is ready"


	echo "Setting up sessions key..."

	vault kv put secret/sessions sessions="${REDDIT_SESSIONS}"

	vault kv put secret/database \
		username="${POSTGRES_USER}" \
		password="${POSTGRES_PASSWORD}" \
		host="postgres" \
		port="5432" \
		database="${POSTGRES_DB}"

	unset VAULT_ADDR VAULT_TOKEN REDDIT_SESSIONS POSTGRES_PASSWORD
}

configure_vault &

exec /usr/local/bin/docker-entrypoint.sh "$@"
