# reporting-svc/Dockerfile — NestJS Reporting microservice
FROM node:22-alpine AS build

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json ./
RUN pnpm install

COPY . .
RUN pnpm run build

EXPOSE 3003
ENV PORT=3003

CMD ["pnpm", "run", "start:prod"]
