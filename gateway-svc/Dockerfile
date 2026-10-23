# gateway-svc/Dockerfile — NestJS Gateway microservice
FROM node:22-alpine AS build

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate

# Copy the lockfile and workspace config so the install layer is cached and
# the install is reproducible (frozen lockfile).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm config set fetch-timeout 300000 && pnpm config set fetch-retries 5 && pnpm install --ignore-scripts --frozen-lockfile

COPY . .
RUN ./node_modules/.bin/nest build

EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "dist/main.js"]
