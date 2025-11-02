import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { redis, ensureConnected } from '@/lib/redis/client';

export async function GET() {
  try {
    const checks = {
      database: false,
      redis: false,
      timestamp: new Date().toISOString(),
    };

    // Check database
    try {
      await prisma.$queryRaw`SELECT 1`;
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

    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'unhealthy',
        ...checks,
      },
      { status: isHealthy ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
