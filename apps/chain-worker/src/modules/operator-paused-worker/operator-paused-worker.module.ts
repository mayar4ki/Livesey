import { Module } from '@nestjs/common';
import { OperatorPausedWorkerService } from './operator-paused-worker.service.js';
import { WatermarkService } from '../../lib/watermark/watermark.service.js';

@Module({
  providers: [OperatorPausedWorkerService, WatermarkService],
  exports: [OperatorPausedWorkerService],
})
export class OperatorPausedWorkerModule {}
