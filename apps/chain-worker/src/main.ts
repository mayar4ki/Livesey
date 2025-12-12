import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { OperatorAddedWorkerService } from './modules/operator-added-worker/operator-added-worker.service.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  app.get(OperatorAddedWorkerService); // triggers onModuleInit to start worker

  app.enableShutdownHooks();
}
bootstrap();
