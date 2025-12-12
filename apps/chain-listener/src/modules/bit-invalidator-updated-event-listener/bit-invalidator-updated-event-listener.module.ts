import { Module } from '@nestjs/common';

import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import { BitInvalidatorUpdatedBackfillService } from './bit-invalidator-updated-backfill.service.js';
import { BitInvalidatorUpdatedListenerInitService } from './bit-invalidator-updated-listener-init.service.js';
import { BitInvalidatorUpdatedQueueService } from './bit-invalidator-updated-queue.service.js';
import { BitInvalidatorUpdatedWatcherService } from './bit-invalidator-updated-watcher.service.js';

@Module({
  providers: [
    BitInvalidatorUpdatedListenerInitService,
    WatermarkService,
    BitInvalidatorUpdatedWatcherService,
    BitInvalidatorUpdatedBackfillService,
    BitInvalidatorUpdatedQueueService,
  ],
})
export class BitInvalidatorUpdatedEventListenerModule {}
