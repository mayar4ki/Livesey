import { Module } from '@nestjs/common';
import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import { OrderFilledWorkerService } from './order-filled-worker.service.js';

@Module({
  providers: [OrderFilledWorkerService, WatermarkService],
  exports: [OrderFilledWorkerService],
})
export class OrderFilledWorkerModule {}
