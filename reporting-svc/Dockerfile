FROM node:22-alpine AS build

WORKDIR /app
RUN apk add --no-cache bash curl jq ca-certificates
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json ./
RUN pnpm config set fetch-timeout 300000 && pnpm config set fetch-retries 5 && pnpm install --ignore-scripts --no-frozen-lockfile
RUN pnpm add @nestjs/schedule
RUN apk add --no-cache postgresql17-client

COPY . .
RUN pnpm exec prisma generate
RUN ./node_modules/.bin/nest build

RUN chmod +x postgres.sh

EXPOSE 3003
ENV PORT=3003

CMD ["./postgres.sh"]
