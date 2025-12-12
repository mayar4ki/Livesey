import { Module } from '@nestjs/common';

import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import { OrderFilledBackfillService } from './order-filled-backfill.service.js';
import { OrderFilledListenerInitService } from './order-filled-listener-init.service.js';
import { OrderFilledQueueService } from './order-filled-queue.service.js';
import { OrderFilledWatcherService } from './order-filled-watcher.service.js';

@Module({
  providers: [
    OrderFilledListenerInitService,
    WatermarkService,
    OrderFilledWatcherService,
    OrderFilledBackfillService,
    OrderFilledQueueService,
  ],
})
export class OrderFilledEventListenerModule {}
