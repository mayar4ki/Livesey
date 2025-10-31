This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- Docker and Docker Compose (for Redis)
- Node.js and Yarn

### Setup

1. **Start Redis service:**

```bash
docker-compose up -d
```

2. **Install dependencies:**

```bash
yarn install
```

3. **Set up environment variables:**

Copy `.env.example` to `.env.local` and update with your values:

```bash
cp .env.example .env.local
```

4. **Start the development server:**

```bash
yarn dev
```

5. **Start the verification worker (in a separate terminal):**

```bash
yarn worker
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Token Verification API

The application includes a token verification system that uses Redis for both task queuing and task persistence. This simplified architecture reduces code complexity while maintaining all necessary functionality.

### API Endpoints

#### POST `/api/token/verify`

Queue a token verification task.

**Request Body:**
```json
{
  "contractAddress": "0x...",
  "chainId": 11155111,
  "sourceCode": "pragma solidity...",
  "compilerVersion": "v0.8.20",
  "optimization": true,
  "runs": 200
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification task queued successfully",
  "taskId": 1,
  "contractAddress": "0x...",
  "chainId": 11155111
}
```

#### GET `/api/token/verify/status?taskId=123`

Get the status of a verification task by task ID.

**Response:**
```json
{
  "success": true,
  "task": {
    "id": 1,
    "contractAddress": "0x...",
    "chainId": 11155111,
    "status": "pending|processing|completed|failed",
    "errorMessage": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "completedAt": null
  }
}
```

### How It Works

1. **API receives verification request** → Creates task in Redis + adds to queue (single operation)
2. **Worker consumes task from Redis queue** → Processes verification → Updates task status in Redis
3. **Client polls status endpoint with taskId** → Check verification progress/result

### Worker

The verification worker (`scripts/verification-worker.ts`) processes tasks from the Redis queue. It:
- Consumes tasks from Redis List (`queue:verification`)
- Updates task status in Redis (key: `task:{id}`)
- Processes verification (currently simulated - implement actual verification logic)

Run the worker with:
```bash
yarn worker
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
