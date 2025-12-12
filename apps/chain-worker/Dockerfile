FROM node:22-alpine AS base

WORKDIR /app
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PNPM_STORE_PATH="/root/.local/share/pnpm/store"
ENV PATH="$PNPM_HOME:$PATH"

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

ARG DATABASE_URL
ARG REDIS_URL
ARG CHAIN_RPC_URL
ARG FACTORY_ADDRESS
ARG BACKEND_URL
ARG CHAIN_ID

ENV NODE_ENV=production
ENV DATABASE_URL=$DATABASE_URL
ENV REDIS_URL=$REDIS_URL
ENV CHAIN_RPC_URL=$CHAIN_RPC_URL
ENV FACTORY_ADDRESS=$FACTORY_ADDRESS
ENV BACKEND_URL=$BACKEND_URL
ENV CHAIN_ID=$CHAIN_ID

RUN pnpm turbo run build --filter chain-listener...
RUN pnpm deploy --filter chain-listener --prod /app/.output/chain-listener

FROM node:22-alpine AS runner

WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production

COPY --from=builder /app/.output/chain-listener/ .

CMD ["node", "dist/main.js"]
