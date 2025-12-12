import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './lib/prisma/prisma.module.js';
import { RedisModule } from './lib/redis/redis.module.js';
import { ViemModule } from './lib/viem/viem.module.js';

import { OperatorAddedWorkerModule } from './modules/operator-added-worker/operator-added-worker.module.js';
import { validateEnv } from './schemas/env-validation-schema.js';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    ViemModule,
    OperatorAddedWorkerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
  ],
  providers: [Logger],
})
export class AppModule {}
