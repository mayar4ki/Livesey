import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { OrderCancelledWorkerService } from './modules/order-cancelled-worker/order-cancelled-worker.service.js';
import { OperatorAddedWorkerService } from './modules/operator-added-worker/operator-added-worker.service.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  app.get(OperatorAddedWorkerService); // triggers onModuleInit to start worker
  app.get(OrderCancelledWorkerService); // triggers onModuleInit to start worker

  app.enableShutdownHooks();
}
bootstrap();
