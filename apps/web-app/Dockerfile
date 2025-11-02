# Multi-stage Dockerfile for Livesey Monorepo
# Handles contract compilation, web-app build, and worker setup

FROM node:20-alpine AS base

# Install dependencies needed for Hardhat (Solidity compiler)
RUN apk add --no-cache libc6-compat python3 make g++ git

WORKDIR /app

# Copy root package files for monorepo setup
COPY package.json yarn.lock ./
COPY turbo.json ./

# Copy workspace package files
COPY packages/token-smart-contract/package.json ./packages/token-smart-contract/
COPY packages/db/package.json ./packages/db/
COPY apps/web-app/package.json ./apps/web-app/
COPY apps/verification-worker/package.json ./apps/verification-worker/

# Install all dependencies (workspace-aware)
RUN yarn install --frozen-lockfile

# ============================================
# Stage 1: Build Contracts
# ============================================
FROM base AS contract-builder

WORKDIR /app

# Copy contract source files and config
COPY packages/token-smart-contract ./packages/token-smart-contract

# Compile contracts (generates artifacts)
WORKDIR /app/packages/token-smart-contract
RUN yarn hardhat compile

# ============================================
# Stage 2: Build Web App
# ============================================
FROM base AS web-app-builder

WORKDIR /app

# Copy compiled contract artifacts from contract-builder
COPY --from=contract-builder /app/packages/token-smart-contract/artifacts ./packages/token-smart-contract/artifacts
COPY --from=contract-builder /app/packages/token-smart-contract/index.ts ./packages/token-smart-contract/index.ts
COPY --from=contract-builder /app/packages/token-smart-contract/package.json ./packages/token-smart-contract/package.json

# Copy web-app source
COPY apps/web-app ./apps/web-app

# Copy db package and generate Prisma Client
COPY packages/db ./packages/db
WORKDIR /app/packages/db
RUN yarn db:generate

# Build Next.js app
RUN yarn build

# ============================================
# Stage 3: Build Worker (with Hardhat)
# ============================================
FROM base AS worker-builder

WORKDIR /app

# Copy entire contract package (worker needs Hardhat for verification)
COPY packages/token-smart-contract ./packages/token-smart-contract

# Copy verification-worker source
COPY apps/verification-worker ./apps/verification-worker

# Copy db package and generate Prisma Client for worker
COPY packages/db ./packages/db
WORKDIR /app/packages/db
RUN yarn db:generate

# ============================================
# Stage 4: Production Web App
# ============================================
FROM node:20-alpine AS web-app-runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY apps/web-app/package.json ./package.json
COPY packages/token-smart-contract/package.json ./packages/token-smart-contract/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY yarn.lock ./

# Install production dependencies only
RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

# Copy built app and contract artifacts
COPY --from=web-app-builder /app/apps/web-app/.next ./.next
COPY --from=web-app-builder /app/apps/web-app/public ./public
COPY --from=web-app-builder /app/apps/web-app/package.json ./package.json
COPY --from=web-app-builder /app/packages/db/node_modules/.prisma ./node_modules/.prisma
COPY --from=web-app-builder /app/packages/token-smart-contract/artifacts ./packages/token-smart-contract/artifacts
COPY --from=web-app-builder /app/packages/token-smart-contract/index.ts ./packages/token-smart-contract/index.ts
COPY --from=web-app-builder /app/packages/token-smart-contract/package.json ./packages/token-smart-contract/package.json

# Copy node_modules for @acme/token-smart-contract
COPY --from=web-app-builder /app/node_modules/@acme ./node_modules/@acme

EXPOSE 3000

CMD ["yarn", "start"]

# ============================================
# Stage 5: Production Worker
# ============================================
FROM node:20-alpine AS worker-runner

WORKDIR /app

ENV NODE_ENV=production

# Install build dependencies for Hardhat
RUN apk add --no-cache python3 make g++ git

# Copy package files
COPY package.json yarn.lock ./
COPY packages/token-smart-contract/package.json ./packages/token-smart-contract/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY apps/verification-worker/package.json ./apps/verification-worker/package.json

# Install all dependencies (worker needs dev dependencies for Hardhat)
RUN yarn install --frozen-lockfile

# Copy contract package with Hardhat and compiled artifacts
COPY --from=worker-builder /app/packages/token-smart-contract ./packages/token-smart-contract

# Copy worker source files
COPY --from=worker-builder /app/apps/verification-worker ./apps/verification-worker

# Copy db package
COPY --from=worker-builder /app/packages/db ./packages/db

# Copy entrypoint script for creating .env.sepolia file (copy from build context)
COPY apps/web-app/scripts/docker-entrypoint-worker.sh /usr/local/bin/docker-entrypoint-worker.sh
RUN chmod +x /usr/local/bin/docker-entrypoint-worker.sh

# Generate Prisma Client (fresh generation after dependency install)
WORKDIR /app/packages/db
RUN yarn db:generate

WORKDIR /app/apps/verification-worker

ENTRYPOINT ["/usr/local/bin/docker-entrypoint-worker.sh"]
CMD ["yarn", "start:prod"]

