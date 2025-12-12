import { Module } from '@nestjs/common';

import { OrderCancelledWorkerService } from './order-cancelled-worker.service.js';

@Module({
  providers: [OrderCancelledWorkerService],
  exports: [OrderCancelledWorkerService],
})
export class OrderCancelledWorkerModule {}
