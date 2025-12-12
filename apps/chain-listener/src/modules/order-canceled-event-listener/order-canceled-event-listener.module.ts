import { Module } from '@nestjs/common';

import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import { OrderCancelledBackfillService } from './order-cancelled-backfill.service.js';
import { OrderCancelledListenerInitService } from './order-cancelled-listener-init.service.js';
import { OrderCancelledQueueService } from './order-cancelled-queue.service.js';
import { OrderCancelledWatcherService } from './order-cancelled-watcher.service.js';

@Module({
  providers: [
    OrderCancelledListenerInitService,
    WatermarkService,
    OrderCancelledWatcherService,
    OrderCancelledBackfillService,
    OrderCancelledQueueService,
  ],
})
export class OrderCanceledEventListenerModule {}
