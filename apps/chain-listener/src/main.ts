import "reflect-metadata";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: new Logger("ChainListenerBootstrap"),
  });

  app.enableShutdownHooks();
}
bootstrap();