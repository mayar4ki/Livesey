import { createClient, RedisClientType } from "redis";

// Redis URL format: redis://:password@host:port
const REDIS_URL = process.env.REDIS_URL || "redis://:redis@localhost:6379";

export const QUEUE_NAME = "queue:verification";

// Create Redis client
const redis: RedisClientType = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error("Too many Redis reconnection attempts");
        return new Error("Too many retries");
      }
      const delay = Math.min(retries * 50, 2000);
      return delay;
    },
  },
});

redis.on("error", (err: Error) => {
  console.error("Redis connection error:", err);
});

redis.on("connect", () => {
  console.log("Connecting to Redis...");
});

redis.on("ready", () => {
  console.log("Connected to Redis");
});

// Connect to Redis (lazy connection)
let isConnected = false;
export async function ensureConnected(): Promise<void> {
  if (!isConnected) {
    if (!redis.isOpen) {
      await redis.connect();
    }
    isConnected = true;
  }
}

// Initialize connection on import
ensureConnected().catch((err) => {
  console.error("Failed to connect to Redis:", err);
});

/**
 * Close Redis connection (for cleanup)
 */
export async function closeRedisConnection(): Promise<void> {
  if (redis.isOpen) {
    await redis.quit();
    isConnected = false;
  }
}

export type { RedisClientType };
export { redis };
