# auth-svc/Dockerfile — NestJS Auth microservice
FROM node:22-alpine AS build

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json ./
RUN pnpm config set fetch-timeout 300000 && pnpm config set fetch-retries 5 && pnpm install --ignore-scripts --no-frozen-lockfile

COPY . .
RUN ./node_modules/.bin/nest build

EXPOSE 3002
ENV PORT=3002

CMD ["node", "dist/main.js"]
