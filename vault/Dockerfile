FROM hashicorp/vault:1.15

EXPOSE 8200

COPY --chmod=755 tools/entrypoint.sh /entrypoint.sh
COPY --chmod=755 conf/server.hcl /vault/config/server.hcl

RUN apk add --no-cache jq bash

ENTRYPOINT [ "/entrypoint.sh" ]

CMD [ "server" ]
