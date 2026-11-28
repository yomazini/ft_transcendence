FROM stripe/stripe-cli:latest AS stripe-source

RUN cp "$(command -v stripe)" /tmp/stripe

FROM alpine:3.22

RUN apk add --no-cache curl jq ca-certificates

COPY --from=stripe-source /tmp/stripe /usr/local/bin/stripe

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]