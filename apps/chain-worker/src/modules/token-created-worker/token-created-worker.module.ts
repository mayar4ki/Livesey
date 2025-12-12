import { Module } from '@nestjs/common';

import { TokenCreatedWorkerService } from './token-created-worker.service.js';
import { QueueVerificationTaskService } from '../verification/queue-verification-task.service.js';

@Module({
  providers: [TokenCreatedWorkerService, QueueVerificationTaskService],
  exports: [TokenCreatedWorkerService],
})
export class TokenCreatedWorkerModule {}
