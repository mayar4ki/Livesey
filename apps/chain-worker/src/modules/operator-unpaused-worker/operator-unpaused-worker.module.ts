import { Module } from '@nestjs/common';

import { OperatorUnpausedWorkerService } from './operator-unpaused-worker.service.js';

@Module({
  providers: [OperatorUnpausedWorkerService],
  exports: [OperatorUnpausedWorkerService],
})
export class OperatorUnpausedWorkerModule {}
