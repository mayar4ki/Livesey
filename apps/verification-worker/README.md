# Chain Listener

A service that listens to blockchain events from the Factory smart contract and stores deployed token information in the database.

## Overview

The chain-listener monitors the `BeaconProxyCreated` event emitted by the Factory contract. When a new token is deployed, it:

1. Validates the event data
2. Stores token information in PostgreSQL
3. Queues verification tasks in Redis

## Environment Variables

Required environment variables (validated on startup):

- `CHAIN_RPC_URL` - RPC endpoint URL (e.g., `https://sepolia.infura.io/v3/...`)
- `FACTORY_ADDRESS` - Factory contract address (0x format)
- `CHAIN_ID` - Chain ID (defaults to 11155111 for Sepolia if not provided)
- `REDIS_URL` - Redis connection URL (optional, uses default if not provided)
- `DATABASE_URL` - PostgreSQL connection URL (required for storing tokens)

## Architecture

```
┌─────────────────┐
│  Factory Contract│
│  (Blockchain)    │
└────────┬─────────┘
         │
         │ BeaconProxyCreated Event
         │
         ▼
┌─────────────────┐
│  Chain Listener │
│  (watchContractEvent)│
└────────┬─────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌──────────────┐   ┌──────────────┐
│  PostgreSQL  │   │    Redis     │
│  (Store)     │   │  (Queue)     │
└──────────────┘   └──────────────┘
```

## Data Flow

1. **Event Detection**: `watchContractEvent` detects `BeaconProxyCreated` events
2. **Validation**: Event arguments are validated using Zod schemas
3. **Storage**: Valid tokens are stored in `DeployedToken` table (batch transaction)
4. **Queueing**: Verification tasks are queued in Redis for `verification-worker`

## Failure Handling & Recovery

### Problem: Handling Listener Failures

The chain-listener can fail in several scenarios, this will lead to missed events.

⚠️ **TODO**: Implement failure recovery mechanisms:

- [ ] Track last processed block from `DeployedToken.blockNumber`
- [ ] Backfill function to catch missed events
- [ ] Gap detection on startup
- [ ] Periodic gap checking
- [ ] Process management (PM2/Docker)
- [ ] Health check endpoint
