#!/bin/sh

set -eu
umask 077

rm -f /tmp/stripe-ready

echo "Getting Stripe credentials from Vault..."

TOKEN=$(curl -fsS \
  -X POST \
  -H "Content-Type: application/json" \
  --data-binary @/run/vault/login.json \
  http://vault:8200/v1/auth/approle/login \
  | jq -er '.auth.client_token')

echo "Vault authentication successful"

JSON=$(curl -fsS \
  -H "X-Vault-Token: $TOKEN" \
  http://vault:8200/v1/secret/data/auth-svc)

STRIPE_API_KEY=$(printf '%s' "$JSON" \
  | jq -er '.data.data.secret_key')

export STRIPE_API_KEY

unset JSON

echo "Stripe API key retrieved"

echo "Starting Stripe listener..."

stripe listen \
  --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted \
  --forward-to http://auth-svc:3002/orgs/billing/webhook \
  > /tmp/stripe.log 2>&1 &

STRIPE_PID=$!

cleanup() {
  rm -f /tmp/stripe-ready /tmp/stripe.log
  kill "$STRIPE_PID" 2>/dev/null || true
}

trap cleanup EXIT
trap 'exit 0' INT TERM

echo "Waiting for webhook secret..."

WEBHOOK_SECRET=""

for i in $(seq 1 30); do

  if ! kill -0 "$STRIPE_PID" 2>/dev/null; then
    echo "Stripe listener stopped"
    exit 1
  fi

  WEBHOOK_SECRET=$(grep -oE 'whsec_[a-zA-Z0-9_]+' \
    /tmp/stripe.log | head -n 1 || true)

  if [ -n "$WEBHOOK_SECRET" ]; then
    break
  fi

  sleep 2
done

if [ -z "$WEBHOOK_SECRET" ]; then
  echo "Failed to get webhook secret"
  exit 1
fi

echo "Updating webhook secret in Vault..."

curl -fsS \
  -X PATCH \
  -H "X-Vault-Token: $TOKEN" \
  -H "Content-Type: application/merge-patch+json" \
  -d "$(jq -n \
    --arg secret "$WEBHOOK_SECRET" \
    '{data: {secret_strip_webhooks: $secret}}')" \
  http://vault:8200/v1/secret/data/auth-svc \
  > /dev/null

unset TOKEN WEBHOOK_SECRET STRIPE_API_KEY

kill -0 "$STRIPE_PID"

touch /tmp/stripe-ready

echo "Stripe CLI is ready"

wait "$STRIPE_PID"