import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { TokenModule } from './token/token.module';
import { ViemModule } from './viem/viem.module';

@Module({
  imports: [PrismaModule, RedisModule, ViemModule, TokenModule, HealthModule],
})
export class AppModule {}
