import { Module } from '@nestjs/common';

import { QueueVerificationTaskService } from './queue-verification-task.service.js';
import { TokenCreatedWorkerService } from './token-created-worker.service.js';

@Module({
  providers: [TokenCreatedWorkerService, QueueVerificationTaskService],
  exports: [TokenCreatedWorkerService],
})
export class TokenCreatedWorkerModule {}
