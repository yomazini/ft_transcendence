FROM hashicorp/vault:1.15

EXPOSE 8200

COPY --chmod=755 tools/entrypoint.sh /entrypoint.sh
COPY --chmod=755 tools/vault-py/ /vault-py/
COPY --chmod=755 tools/health_check.sh /health_check.sh
COPY conf/server.hcl /config/server.hcl
COPY conf/config.json /config/config.json


RUN apk add --no-cache jq curl

RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

RUN uv sync --project /vault-py --frozen --no-dev

ENTRYPOINT [ "/entrypoint.sh" ]

CMD [ "server" ]
