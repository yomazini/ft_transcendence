#!/bin/sh
set -eu

export VAULT_ADDR="http://127.0.0.1:8200"

vault status >/dev/null 2>&1
jq -e '.ready == true' "$CREDS_FILE" >/dev/null 2>&1