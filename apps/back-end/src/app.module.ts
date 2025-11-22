import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env-validation.schema';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './lib/prisma/prisma.module';
import { RedisModule } from './lib/redis/redis.module';

import { ViemModule } from './lib/viem/viem.module';
import { LimitOrderModule } from './limit-order/limit-order.module';
import { ProposalModule } from './proposal/proposal.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    ViemModule,
    TokenModule,
    ProposalModule,
    LimitOrderModule,
    HealthModule,
    ConfigModule.forRoot({
      validate: validateEnv,
      isGlobal: true, // Make config available globally
    }),
  ],
})
export class AppModule {}
