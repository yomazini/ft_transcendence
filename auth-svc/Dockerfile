FROM node:22-slim
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.4.2 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm exec prisma generate && pnpm exec nest build

EXPOSE 3002

ENV PORT=3002

CMD ["node", "dist/src/main.js"]
