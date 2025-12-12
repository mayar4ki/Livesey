import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { BitInvalidatorUpdatedWorkerService } from './modules/bit-invalidator-updated-worker/bit-invalidator-updated-worker.service.js';
import { OrderCancelledWorkerService } from './modules/order-cancelled-worker/order-cancelled-worker.service.js';
import { OrderFilledWorkerService } from './modules/order-filled-worker/order-filled-worker.service.js';
import { OperatorAddedWorkerService } from './modules/operator-added-worker/operator-added-worker.service.js';
import { OperatorPausedWorkerService } from './modules/operator-paused-worker/operator-paused-worker.service.js';
import { OperatorUnpausedWorkerService } from './modules/operator-unpaused-worker/operator-unpaused-worker.service.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  app.get(OperatorAddedWorkerService); // triggers onModuleInit to start worker
  app.get(OrderCancelledWorkerService); // triggers onModuleInit to start worker
  app.get(OrderFilledWorkerService); // triggers onModuleInit to start worker
  app.get(OperatorPausedWorkerService); // triggers onModuleInit to start worker
  app.get(OperatorUnpausedWorkerService); // triggers onModuleInit to start worker
  app.get(BitInvalidatorUpdatedWorkerService); // triggers onModuleInit to start worker

  app.enableShutdownHooks();
}
bootstrap();
