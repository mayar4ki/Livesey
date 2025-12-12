import { Module } from '@nestjs/common';
import { OperatorUnpausedWorkerService } from './operator-unpaused-worker.service.js';
import { WatermarkService } from '../../lib/watermark/watermark.service.js';

@Module({
  providers: [OperatorUnpausedWorkerService, WatermarkService],
  exports: [OperatorUnpausedWorkerService],
})
export class OperatorUnpausedWorkerModule {}
