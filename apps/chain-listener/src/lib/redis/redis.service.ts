import { closeRedisConnection, ensureConnected, redis, type RedisClientType } from '@acme/cache/client';
import { Injectable, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class RedisService implements OnModuleDestroy {
  // Directly expose the redis client from @acme/cache/client
  readonly client: RedisClientType = redis;

  // Expose the ensureConnected function for convenience
  async ensureConnected(): Promise<void> {
    return ensureConnected();
  }

  // Close Redis connection when module is destroyed
  async onModuleDestroy() {
    await closeRedisConnection();
  }
}
