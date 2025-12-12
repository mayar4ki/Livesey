import { Module } from '@nestjs/common';

import { OrderFilledWorkerService } from './order-filled-worker.service.js';

@Module({
  providers: [OrderFilledWorkerService],
  exports: [OrderFilledWorkerService],
})
export class OrderFilledWorkerModule {}
