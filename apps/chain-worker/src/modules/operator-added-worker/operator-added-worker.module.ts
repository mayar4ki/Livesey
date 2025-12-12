import { Module } from '@nestjs/common';
import { OperatorAddedWorkerService } from './operator-added-worker.service.js';
import { WatermarkService } from '../../lib/watermark/watermark.service.js';

@Module({
  providers: [OperatorAddedWorkerService, WatermarkService],
  exports: [OperatorAddedWorkerService],
})
export class OperatorAddedWorkerModule {}
