
FROM postgres:17-bookworm

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        jq \
        openssl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

ARG MC_VERSION=RELEASE.2025-08-13T08-35-41Z

RUN set -eux; \
    ARCH="$(dpkg --print-architecture)"; \
    case "$ARCH" in \
        amd64|arm64) ;; \
        *) echo "Unsupported architecture: $ARCH"; exit 1 ;; \
    esac; \
    curl -fsSL \
        "https://github.com/minio/mc/releases/download/${MC_VERSION}/mc.linux-${ARCH}.${MC_VERSION}" \
        -o /usr/local/bin/mc; \
    chmod 755 /usr/local/bin/mc; \
    mc --version

RUN mkdir -p /app /tmp/backups && \
    chown -R postgres:postgres /app /tmp/backups

WORKDIR /app

COPY --chmod=755 ./scripts/restor.sh /app/restore.sh

ENTRYPOINT ["/bin/sh", "/app/restore.sh"]
