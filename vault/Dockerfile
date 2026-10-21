FROM hashicorp/vault:1.15

EXPOSE 8200

COPY --chmod=755 tools/entrypoint.sh /entrypoint.sh
COPY --chmod=755 tools/secret_update.sh /secret_update.sh
COPY --chmod=755 tools/configuration.sh /configuration.sh
COPY --chmod=755 tools/health_check.sh /health_check.sh
COPY --chmod=755 conf/server.hcl /config/server.hcl
COPY conf/policies/ /policies/

RUN apk add --no-cache jq bash

ENTRYPOINT [ "/entrypoint.sh" ]

CMD [ "server" ]
