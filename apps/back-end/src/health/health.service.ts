import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { redis, ensureConnected } from '@acme/queue/client';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkHealth() {
    const checks = {
      database: false,
      redis: false,
      timestamp: new Date().toISOString(),
    };

    // Check database
    try {
      await this.prisma.client.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // Check Redis
    try {
      await ensureConnected();
      await redis.ping();
      checks.redis = true;
    } catch (error) {
      console.error('Redis health check failed:', error);
    }

    const isHealthy = checks.database && checks.redis;

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      ...checks,
    };
  }
}

