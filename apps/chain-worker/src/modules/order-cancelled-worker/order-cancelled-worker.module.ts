import { Module } from '@nestjs/common';
import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import { OrderCancelledWorkerService } from './order-cancelled-worker.service.js';

@Module({
  providers: [OrderCancelledWorkerService, WatermarkService],
  exports: [OrderCancelledWorkerService],
})
export class OrderCancelledWorkerModule {}
