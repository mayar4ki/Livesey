import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './lib/prisma/prisma.module.js';
import { RedisModule } from './lib/redis/redis.module.js';
import { ViemModule } from './lib/viem/viem.module.js';

import { OrderCancelledWorkerModule } from './modules/order-cancelled-worker/order-cancelled-worker.module.js';
import { OrderFilledWorkerModule } from './modules/order-filled-worker/order-filled-worker.module.js';
import { OperatorAddedWorkerModule } from './modules/operator-added-worker/operator-added-worker.module.js';
import { BitInvalidatorUpdatedWorkerModule } from './modules/bit-invalidator-updated-worker/bit-invalidator-updated-worker.module.js';
import { OperatorPausedWorkerModule } from './modules/operator-paused-worker/operator-paused-worker.module.js';
import { OperatorUnpausedWorkerModule } from './modules/operator-unpaused-worker/operator-unpaused-worker.module.js';
import { TokenOperatorChangedWorkerModule } from './modules/token-operator-changed-worker/token-operator-changed-worker.module.js';
import { TokenCreatedWorkerModule } from './modules/token-created-worker/token-created-worker.module.js';
import { validateEnv } from './schemas/env-validation-schema.js';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    ViemModule,
    OperatorAddedWorkerModule,
    OrderCancelledWorkerModule,
    OrderFilledWorkerModule,
    BitInvalidatorUpdatedWorkerModule,
    OperatorPausedWorkerModule,
    OperatorUnpausedWorkerModule,
    TokenOperatorChangedWorkerModule,
    TokenCreatedWorkerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
  ],
  providers: [Logger],
})
export class AppModule {}
