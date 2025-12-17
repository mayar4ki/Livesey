FROM node:24-alpine AS base

WORKDIR /app
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PNPM_STORE_PATH="/root/.local/share/pnpm/store"
ENV PATH="$PNPM_HOME:$PATH"

# Needed for Prisma and OpenSSL
RUN apk add --no-cache libc6-compat openssl && \
  corepack enable && corepack prepare pnpm@10.19.0 --activate

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
RUN --mount=type=cache,id=pnpm-store,target=$PNPM_STORE_PATH \
  pnpm fetch --frozen-lockfile

COPY apps apps
COPY packages packages
COPY tooling tooling

RUN --mount=type=cache,id=pnpm-store,target=$PNPM_STORE_PATH \
  pnpm install --frozen-lockfile --prefer-offline

FROM deps AS builder

# Build-time configuration for Prisma and blockchain deps
ARG DATABASE_URL
ARG REDIS_URL
ARG CHAIN_RPC_URL
ARG FACTORY_ADDRESS
ARG CHAIN_ID

ENV NODE_ENV=production
ENV DATABASE_URL=$DATABASE_URL
ENV REDIS_URL=$REDIS_URL
ENV CHAIN_RPC_URL=$CHAIN_RPC_URL
ENV FACTORY_ADDRESS=$FACTORY_ADDRESS
ENV CHAIN_ID=$CHAIN_ID

RUN pnpm turbo run build --filter back-end...
RUN pnpm deploy --legacy --filter back-end --prod /app/.output/back-end

FROM builder AS migrator

CMD ["pnpm", "--filter", "@acme/db", "db:migrate:deploy"]

FROM node:24-alpine AS runner

WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production

COPY --from=builder --chown=node:node /app/.output/back-end/ .

USER node

EXPOSE 3002

CMD ["node", "dist/main.js"]
