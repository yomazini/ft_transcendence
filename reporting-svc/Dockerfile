FROM node:22-trixie-slim

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    curl \
    jq \
    ca-certificates \
    postgresql-client-17 \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@12.6.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY src ./src
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY ./scripts/start.sh ./
COPY prisma.config.ts ./

RUN set -e; \
    pnpm install --frozen-lockfile; \
    pnpm exec prisma generate; \
    pnpm exec nest build; \
    pnpm prune --prod; \
    mkdir -p /app; \
    cp -a node_modules dist prisma package.json pnpm-lock.yaml pnpm-workspace.yaml start.sh prisma.config.ts /app/; \
    chmod +x /app/start.sh; \
    cd /app; \
    rm -rf /build; \
    rm -rf "$(pnpm store path)"

WORKDIR /app

EXPOSE 3003

CMD ["./start.sh"]