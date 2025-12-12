import { Module } from '@nestjs/common';

import { VerificationWorkerService } from './verification-worker.service.js';

@Module({
  providers: [VerificationWorkerService],
  exports: [VerificationWorkerService],
})
export class VerificationWorkerModule {}
