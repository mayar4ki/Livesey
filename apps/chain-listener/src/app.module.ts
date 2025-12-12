import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './lib/prisma/prisma.module.js';
import { RedisModule } from './lib/redis/redis.module.js';
import { ViemModule } from './lib/viem/viem.module.js';

import { BitInvalidatorUpdatedEventListenerModule } from './modules/bit-invalidator-updated-event-listener/bit-invalidator-updated-event-listener.module.js';
import { NewAdminAddressEventListenerModule } from './modules/new-admin-address-event-listener/new-admin-address-event-listener.module.js';
import { NewTokenCreatedEventListenerModule } from './modules/new-token-created-event-listener/new-token-created-event-listener.module.js';
import { OperatorAddedEventListenerModule } from './modules/operator-added-event-listener/operator-added-event-listener.module.js';

import { OperatorPausedEventListenerModule } from './modules/operator-paused-event-listener/operator-paused-event-listener.module.js';
import { OperatorUnpausedEventListenerModule } from './modules/operator-unpaused-event-listener/operator-unpaused-event-listener.module.js';
import { OrderCanceledEventListenerModule } from './modules/order-canceled-event-listener/order-canceled-event-listener.module.js';
import { OrderFilledEventListenerModule } from './modules/order-fill-event-listener/order-fill-event-listener.module.js';
import { TokenOperatorChangedEventListenerModule } from './modules/token-operator-changed-event-listener/token-operator-changed-listener.module.js';
import { validateEnv } from './schemas/env-validation-schema.js';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    ViemModule,
    NewAdminAddressEventListenerModule,
    NewTokenCreatedEventListenerModule,
    OperatorAddedEventListenerModule,
    OperatorPausedEventListenerModule,
    OperatorUnpausedEventListenerModule,
    TokenOperatorChangedEventListenerModule,
    OrderFilledEventListenerModule,
    OrderCanceledEventListenerModule,
    BitInvalidatorUpdatedEventListenerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
  ],
  providers: [Logger],
})
export class AppModule {}
