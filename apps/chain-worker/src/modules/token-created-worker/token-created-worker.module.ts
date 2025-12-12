import { Module } from '@nestjs/common';

import { QueueVerificationTaskService } from './queue-verification-task.service.js';
import { TokenCreatedWorkerService } from './token-created-worker.service.js';
import { WatermarkService } from '../../lib/watermark/watermark.service.js';

@Module({
  providers: [TokenCreatedWorkerService, QueueVerificationTaskService, WatermarkService],
  exports: [TokenCreatedWorkerService],
})
export class TokenCreatedWorkerModule {}
