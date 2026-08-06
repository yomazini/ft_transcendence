# gateway-svc/Dockerfile — NestJS Gateway microservice
FROM node:22-alpine AS build

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json ./
RUN pnpm install

COPY . .
RUN pnpm run build

EXPOSE 3001
ENV PORT=3001

CMD ["pnpm", "run", "start:prod"]
