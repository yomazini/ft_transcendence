#!/bin/bash

set -eEo pipefail

trap 'kill -TERM 1; exit 1' ERR

umask 077

services=("analysis-svc" "database" "minio" "auth-svc" "grafana" "scraper-svc" "gateway-svc")
while true; do
	sleep 3540

	for role in ${services[@]}; do
		old="$(jq -r --arg role "$role" '.roles[$role] // empty' "$CREDS_FILE")"
		role_id="$(vault read -field=role_id "auth/approle/role/$role/role-id")"
		secret_data="$(vault write -f -format=json "auth/approle/role/$role/secret-id" | jq '{secret_id: .data.secret_id, accessor_id: .data.secret_id_accessor}')"
		jq -n --arg role_id "$role_id" --arg secret_id "$(jq -r '.secret_id' <<< "$secret_data")" '{role_id: $role_id, secret_id: $secret_id}' > "/credentials/$role/login.json"
		if [ -n "$old" ]; then
			vault write auth/approle/role/"$role"/secret-id-accessor/destroy secret_id_accessor="$old" || true 
		fi
		jq --arg role "$role" --arg accessor "$(jq -r '.accessor_id' <<< "$secret_data")" '.roles[$role] = $accessor' "$CREDS_FILE" > "$CREDS_FILE.tmp"
		mv "$CREDS_FILE.tmp" "$CREDS_FILE"
	done
	echo "Rotated role secrets successfully"
done
