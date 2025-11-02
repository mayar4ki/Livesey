# Livesey

Livesey monorepo powered by Turborepo.

## Development

### Setup

```bash
# 1. Install dependencies
yarn install

# 2. Set up environment variables
# 2.1. Create .env.local in apps/web-app/ with:
 - DATABASE_URL=postgresql://user:pass@postgres:5432/livesey
 - REDIS_URL=redis://:password@redis:6379
 - NEXT_PUBLIC_ETH_SEPOLIA_CHAIN_RPC_URL=your_rpc_url
 - NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_key

# 2.2. Create .env.sepolia in apps/web-app/ with:
 - CHAIN_RPC_URL=your_rpc_url
 - ACCOUNT_PRIVATE_KEY=your_private_key
 - ETHERSCAN_API_KEY=your_etherscan_key

# 3. Start database and Redis, then set up Prisma
cd apps/web-app
docker-compose up -d
yarn db:generate
yarn db:migrate  # or yarn db:push

# 4. Compile Hardhat contracts
cd packages/token-smart-contract
yarn build
```

### Running

```bash
# Terminal 1: Start web app (from root directory)
yarn dev --filter=web-app

# Terminal 2: Start worker (from apps/web-app directory)
cd apps/web-app
yarn worker
```

The web app will be available at `http://localhost:3000`.

**Note**: In development mode, the web app and worker run directly on your machine while PostgreSQL and Redis run in Docker containers. Hardhat contracts must be compiled before starting the web app, as it imports contract artifacts.

## Production Deployment

### Prerequisites

- Docker and Docker Compose installed
- All environment variables configured

### Deployment Steps

```bash
# 1. Set up environment variables
# Create .env file in the root directory with the following variables:
 - DATABASE_URL=postgresql://user:pass@postgres:5432/livesey
 - REDIS_URL=redis://:password@redis:6379
 - REDIS_PASSWORD=your_redis_password
 - POSTGRES_USER=postgres
 - POSTGRES_PASSWORD=your_postgres_password
 - POSTGRES_DB=livesey
 - NEXT_PUBLIC_ETH_SEPOLIA_CHAIN_RPC_URL=your_rpc_url
 - NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_key
 - CHAIN_RPC_URL=your_rpc_url
 - ACCOUNT_PRIVATE_KEY=keep_it_zeros
 - ETHERSCAN_API_KEY=your_etherscan_key

# 2. Build all Docker images
docker-compose -f docker-compose.prod.yml build

# 3. Run database migrations
docker-compose -f docker-compose.prod.yml run --rm web-app yarn db:migrate:deploy

# 4. Start all services
docker-compose -f docker-compose.prod.yml up -d

# 5. View logs (optional)
docker-compose -f docker-compose.prod.yml logs -f
```

### Managing Services

```bash
# Scale worker instances
docker-compose -f docker-compose.prod.yml up -d --scale worker=3
```

### Health Checks

The web app includes a health endpoint at `/api/health` that checks:

- Database connectivity
- Redis connectivity

Returns `200` if healthy, `503` if unhealthy.

### Production Considerations

- **Secrets Management**: Use Docker secrets or external secret management (e.g., AWS Secrets Manager, HashiCorp Vault)
