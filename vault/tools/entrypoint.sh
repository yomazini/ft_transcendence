#!/bin/bash

creds_file="/vault/credentials.json"

init_vault()
{
	vault operator init -key-shares=1 -key-threshold=1 -format=json | jq -r '{unseal_key: .unseal_keys_b64[0], token: .root_token}' >/vault/credentials.json
	chmod 600 $creds_file
}

unseal_vault(){

	if [ ! -f $creds_file ]; then
		init_vault
	fi

	export VAULT_TOKEN=$(jq -rf '.token' $creds_file)

	vault operator unseal $(jq -rf '.unseal_key' $creds_file)
}

seed_vault(){

	vault kv put secret/scraper-svc \
		sessions="${REDDIT_SESSIONS}"

	vault kv put secret/database \
		user="${POSTGRES_USER}" \
		password="${POSTGRES_PASSWORD}" \
	
	vault kv put secret/auth-svc \
		jwt_secret="${JWT_SECRET}" \
		forty_two_client_id="${FORTYTWO_CLIENT_ID}" \
		forty_two_client_secret="${FORTYTWO_CLIENT_SECRET}" \
		mail_user="${MAIL_USER}" \
		mail_pass="${MAIL_PASS}"

	vault kv put secret/analysis-svc \
		gemini_api_key="${GEMINI_API_KEY}" \
		openrouter_api_key="${OPENROUTER_API_KEY}"

	vault kv put secret/grafana \
		password="${GRAFANA_ADMIN_PASSWORD}"

	vault kv put secret/minio \
		user="${MINIO_ROOT_USER}" \
		password="${MINIO_ROOT_PASSWORD}"

	unset REDDIT_SESSIONS POSTGRES_PASSWORD JWT_SECRET FORTYTWO_CLIENT_ID \
		FORTYTWO_CLIENT_SECRET MAIL_PASS GEMINI_API_KEY OPENROUTER_API_KEY \
		GRAFANA_ADMIN_PASSWORD MINIO_ROOT_PASSWORD
}

approle_vault(){
	roles=("auth-svc" "scraper-svc"  "database" "analysis-svc" "grafana" "minio")
	vault write auth/approle/role/auth

}

configure_vault(){

	export VAULT_ADDR="http://127.0.0.1:8200"

	until vault status >/dev/null 2>&1; [ $? -eq 1 ] do
		sleep 1
	done

	unseal_vault

	if [ "$(vault secrets list -format=json | jq -r '."secret/".type')" != 'kv' ];then
		vault secrets enable -path=secret kv-v2
	fi

	seed_vault

	if [ $(vault auth list -format=json | jq '."approle/" != null') != "true" ]; then
		vault auth enable approle
	fi


}

configure_vault &

exec /usr/local/bin/docker-entrypoint.sh "$@"
