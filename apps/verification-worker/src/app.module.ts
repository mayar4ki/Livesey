import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './lib/prisma/prisma.module.js';
import { validateEnv } from './schemas/env-validation-schema.js';
import { VerificationWorkerModule } from './verification-worker/verification-worker.module.js';

@Module({
  imports: [
    PrismaModule,
    VerificationWorkerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
  ],
  providers: [Logger],
})
export class AppModule {}
