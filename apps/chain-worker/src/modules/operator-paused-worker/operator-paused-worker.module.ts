import { Module } from '@nestjs/common';

import { OperatorPausedWorkerService } from './operator-paused-worker.service.js';

@Module({
  providers: [OperatorPausedWorkerService],
  exports: [OperatorPausedWorkerService],
})
export class OperatorPausedWorkerModule {}
