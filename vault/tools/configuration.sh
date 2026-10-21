#!/bin/bash

set -Eeo pipefail

trap 'kill -TERM 1; exit 1' ERR

umask 077

export VAULT_ADDR="http://127.0.0.1:8200"

until vault status >/dev/null 2>&1; [ $? -ne 1 ]; do
	sleep 1
done

if ! vault operator init -status >/dev/null 2>&1; then
    credentials="$(vault operator init -key-shares=1 -key-threshold=1 -format=json)"
	jq --arg ukey "$(jq -r '.unseal_keys_b64[0]' <<< "$credentials")" --arg root "$(jq -r '.root_token' <<< "$credentials")" '.unseal_key = $ukey | .token = $root' "$CREDS_FILE" >"$CREDS_FILE.tmp"
	mv "$CREDS_FILE.tmp" "$CREDS_FILE"
fi

#check valid CREDS_FILE
jq -e 'type == "object" and has("unseal_key") and has("token") and has("roles")' "$CREDS_FILE" >/dev/null 2>&1

vault operator unseal $(jq -r '.unseal_key' $CREDS_FILE)

export VAULT_TOKEN=$(jq -r '.token' $CREDS_FILE)

services=("analysis-svc" "database" "minio" "auth-svc" "grafana" "scraper-svc")

for policy in "${services[@]}"; do
	vault policy write "$policy" /policies/"$policy".hcl
done

if [[ "$(vault auth list -format=json | jq -r 'has("approle/")')" != "true" ]];then
	vault auth enable approle
fi

for role in ${services[@]}; do
	vault write auth/approle/role/"$role" \
		token_policies="$role" \
		token_ttl=1h \
		token_max_ttl=4h \
		secret_id_ttl=4h \
		secret_id_num_uses=0

	old="$(jq -r --arg role "$role" '.roles[$role] // empty' "$CREDS_FILE")"
	role_id="$(vault read -field=role_id "auth/approle/role/$role/role-id")"
	secret_data="$(vault write -f -format=json "auth/approle/role/$role/secret-id" | jq '{secret_id: .data.secret_id, accessor_id: .data.secret_id_accessor}')"
	jq -n --arg role_id "$role_id" --arg secret_id "$(jq -r '.secret_id' <<< "$secret_data")" '{role_id: $role_id, secret_id: $secret_id}' > /credentials/"$role".json
	if [ -n "$old" ]; then
		vault write auth/approle/role/"$role"/secret-id-accessor/destroy secret_id_accessor="$old" || true 
	fi
	jq --arg role "$role" --arg accessor "$(jq -r '.accessor_id' <<< "$secret_data")" '.roles[$role] = $accessor' "$CREDS_FILE" > "$CREDS_FILE.tmp"
	mv "$CREDS_FILE.tmp" "$CREDS_FILE"
done

if [ "$(vault secrets list -format=json | jq -r 'has("secret/")')" != "true" ];then
	vault secrets enable -path=secret -version=2 kv
fi

vault_kvs=$(vault kv list -format=json secret/ || echo '[]')

vault_put (){
	if [ "$(jq -r --arg key "$1" 'index($key) != null' <<<"$vault_kvs")" == "true" ];then
		return
	fi
	vault kv put "secret/$1" "${@:2}"
}

vault_put scraper-svc \
	sessions="${REDDIT_SESSIONS}"

vault_put database \
	user="${POSTGRES_USER}" \
	password="${POSTGRES_PASSWORD}" \

vault_put auth-svc \
	jwt_secret="${JWT_SECRET}" \
	forty_two_client_id="${FORTYTWO_CLIENT_ID}" \
	forty_two_client_secret="${FORTYTWO_CLIENT_SECRET}" \
	mail_user="${MAIL_USER}" \
	mail_pass="${MAIL_PASS}"

vault_put analysis-svc \
	gemini_api_key="${GEMINI_API_KEY}" \
	openrouter_api_key="${OPENROUTER_API_KEY}"

vault_put grafana \
	password="${GRAFANA_ADMIN_PASSWORD}"

vault_put minio \
	user="${MINIO_ROOT_USER}" \
	password="${MINIO_ROOT_PASSWORD}"

unset REDDIT_SESSIONS POSTGRES_PASSWORD JWT_SECRET FORTYTWO_CLIENT_ID \
	FORTYTWO_CLIENT_SECRET MAIL_PASS GEMINI_API_KEY OPENROUTER_API_KEY \
	GRAFANA_ADMIN_PASSWORD MINIO_ROOT_PASSWORD MINIO_ROOT_USER MAIL_USER \
	POSTGRES_USER

jq '.ready = true' "$CREDS_FILE" > "$CREDS_FILE.tmp"
mv "$CREDS_FILE.tmp" "$CREDS_FILE"

exec /secret_update.sh
