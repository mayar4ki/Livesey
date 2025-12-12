import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { VerificationWorkerService } from './verification-worker/verification-worker.service.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });

  app.get(VerificationWorkerService); // triggers onModuleInit to start worker

  app.enableShutdownHooks();
}
bootstrap();
