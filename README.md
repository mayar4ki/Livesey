<div align="center">

# 🏴‍☠️ Livesey

**On-chain token lifecycle platform**

_Watch factory deployments • Queue verification tasks • Limit orders via 1inch • Public + admin frontend_

[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![1inch](https://img.shields.io/badge/1inch-Limit%20Orders-1B314F?logo=1inch&logoColor=white)](https://1inch.io/)
[![Turborepo](https://img.shields.io/badge/built%20with-Turborepo-EF4444?logo=turborepo&logoColor=white)](https://turbo.build/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)

</div>

---

## 📦 Monorepo Structure

```
livesey/
├── apps/
│   ├── back-end/            # NestJS API serving UIs and workers
│   ├── chain-listener/      # Watches factory contract, enqueues verification jobs
│   ├── verification-worker/ # Consumes queue jobs, verifies deployments
│   ├── web-app/             # Public Next.js interface for token launches
│   └── admin-app/           # Admin Next.js dashboard for operations
│
├── packages/
│   ├── db/                  # Prisma schema, migrations, generated client
│   ├── queue/               # Shared Redis queue client and helpers
│   ├── client/              # Frontend utilities for viem + API usage
│   ├── shared/              # Shared types, constants, 1inch limit order helpers (for both frontend and backend)
│   ├── ui/                  # Design system components (shadcn-based)
│   ├── smart-contract/      # Hardhat project: contracts, ABIs, deployments
│   └── white-label/         # Branding/config tokens for web and admin apps
│
└── tooling/
    └── tsconfig/            # Base TypeScript configs
```

---

## 🚀 Quick Start

### Local Development

**1. Start dependencies only:**

```bash
docker compose -f docker-compose.dev.yml up -d
```

**2. Run apps locally** (requires Node 22+ with Corepack pnpm):

```bash
pnpm install
pnpm turbo run dev --filter <app>
```

---

### Production (Docker + BuildKit)

**1. Copy and configure environment:**

```bash
cp .env.docker.example .env
# Edit .env with your Alchemy keys, factory addresses, etc.
```

**2. Build and run with caching:**

```bash
DOCKER_BUILDKIT=1 docker compose up --build
```

**3. Run migrations only:**

```bash
docker compose run --rm db-migrate
```

> **PostgreSQL** `5432` · **Redis** `6379` · **API** `3002` · **Web** `3000` · **Admin** `3006`

---

## ⚙️ Environment Variables

### Database & Cache

| Variable            | Purpose                | Default / Sample                                                     |
| ------------------- | ---------------------- | -------------------------------------------------------------------- |
| `POSTGRES_USER`     | Postgres user          | `postgres`                                                           |
| `POSTGRES_PASSWORD` | Postgres password      | `postgres`                                                           |
| `POSTGRES_DB`       | Database name          | `livesey`                                                            |
| `POSTGRES_PORT`     | Host port for Postgres | `5432`                                                               |
| `DATABASE_URL`      | Connection string      | `postgresql://postgres:postgres@postgres:5432/livesey?schema=public` |
| `REDIS_PASSWORD`    | Redis password         | `redis`                                                              |
| `REDIS_PORT`        | Host port for Redis    | `6379`                                                               |
| `REDIS_URL`         | Redis connection       | `redis://:redis@redis:6379`                                          |

### Backend

| Variable       | Purpose           | Default / Sample           |
| -------------- | ----------------- | -------------------------- |
| `BACKEND_PORT` | Host port for API | `3002`                     |
| `BACKEND_URL`  | Internal API URL  | `http://back-end:3002/api` |

### Blockchain

| Variable          | Purpose                  | Default / Sample                             |
| ----------------- | ------------------------ | -------------------------------------------- |
| `CHAIN_RPC_URL`   | Blockchain RPC endpoint  | `https://your-rpc-endpoint`                  |
| `CHAIN_ID`        | Chain ID                 | `11155111`                                   |
| `FACTORY_ADDRESS` | On-chain factory address | `0x0000000000000000000000000000000000000000` |

### Frontend (Public)

| Variable                                   | Purpose                    | Default / Sample                             |
| ------------------------------------------ | -------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_ALCHEMY_API_KEY`              | Public Alchemy key         | `replace-with-alchemy-key`                   |
| `NEXT_PUBLIC_FACTORY_ADDRESS`              | Factory address            | `0x0000000000000000000000000000000000000000` |
| `NEXT_PUBLIC_ERC20_IMPLEMENTATION_ADDRESS` | ERC20 implementation       | `0x0000000000000000000000000000000000000000` |
| `NEXT_PUBLIC_BACKEND_URL`                  | API URL for frontend       | `http://back-end:3002/api`                   |
| `NEXT_PUBLIC_OUR_ERC20_DECIMALS`           | Our Tokens decimals for UI | `6`                                          |
| `WEB_APP_PORT`                             | Host port for web app      | `3000`                                       |
| `ADMIN_APP_PORT`                           | Host port for admin app    | `3006`                                       |

---

## 📄 License

This project is licensed under the [**PolyForm Noncommercial 1.0.0**](LICENSE).

> You may use, modify, and distribute this software for **non-commercial purposes only**.  
> Commercial use requires a separate license agreement.
