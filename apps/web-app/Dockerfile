FROM node:24-alpine AS base

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

ARG NEXT_PUBLIC_ALCHEMY_API_KEY
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_FACTORY_ADDRESS
ARG NEXT_PUBLIC_ERC20_IMPLEMENTATION_ADDRESS
ARG NEXT_PUBLIC_OUR_ERC20_DECIMALS
ARG PORT=3000

ENV NODE_ENV=production
ENV NEXT_PUBLIC_ALCHEMY_API_KEY=$NEXT_PUBLIC_ALCHEMY_API_KEY
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_FACTORY_ADDRESS=$NEXT_PUBLIC_FACTORY_ADDRESS
ENV NEXT_PUBLIC_ERC20_IMPLEMENTATION_ADDRESS=$NEXT_PUBLIC_ERC20_IMPLEMENTATION_ADDRESS
ENV NEXT_PUBLIC_OUR_ERC20_DECIMALS=$NEXT_PUBLIC_OUR_ERC20_DECIMALS
ENV PORT=$PORT

RUN pnpm turbo run build --filter web-app...

FROM node:24-alpine AS runner

WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production

COPY --from=builder /app/apps/web-app/public ./apps/web-app/public
COPY --from=builder /app/apps/web-app/.next/static ./apps/web-app/.next/static
COPY --from=builder /app/apps/web-app/.next/standalone ./

RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["node", "server.js"]
