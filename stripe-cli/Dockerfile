FROM stripe/stripe-cli:latest

RUN apk add --no-cache curl jq ca-certificates

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
