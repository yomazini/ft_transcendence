<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>


  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# auth-svc

Identity service of InsightFlow (NestJS + Prisma). Owner: Mehdi.

## What it does

| Area | Routes | Code |
|---|---|---|
| Signup, login, logout, password reset, 42 OAuth, profile (`/auth/me`), GDPR export | `/auth/*` | `src/auth/` |
| 2FA (TOTP) | `/auth/2fa/*` | `src/auth/two-factor/` |
| Organizations, members, roles, API keys | `/orgs/*` | `src/org/` |
| Billing (Stripe through `stripe-mock`) | `/orgs/billing/*` | `src/org/billing.*` |
| Prometheus metrics | `/metrics` | `src/metrics/` |
| Mail (invites, resets, receipts) | none | `src/mail/` |

Logout and revoke use a Redis denylist (`src/auth/token-denylist.service.ts`).

## How it runs

- It is started by the root `docker-compose.yml` and listens on port `3002` inside `ft_network`. `gateway-svc` forwards the browser's requests to it. On the host, port 3002 is open only on `127.0.0.1`.
- At start, `src/vault.ts` reads the secrets (database, JWT, 42, mail, Stripe) from Vault. If Vault does not answer, the service exits and Docker restarts it.
- Other settings come from the root `.env` through `docker-compose.yml`. The list of variables is in the root `.env.example`.

## API docs

Swagger UI: `http://localhost:3002/api/docs` (from the host machine).

## Commands

```bash
pnpm install
pnpm run start:dev   # watch mode, outside Docker: needs a local .env
pnpm run test        # unit tests
```

From the repo root: `docker compose up -d --build auth-svc` rebuilds and restarts it.
