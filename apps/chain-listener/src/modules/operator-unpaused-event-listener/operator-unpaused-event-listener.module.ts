import { Module } from '@nestjs/common';

import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import { OperatorUnpausedBackfillService } from './operator-unpaused-backfill.service.js';
import { OperatorUnpausedListenerInitService } from './operator-unpaused-listener-init.service.js';
import { OperatorUnpausedQueueService } from './operator-unpaused-queue.service.js';
import { OperatorUnpausedWatcherService } from './operator-unpaused-watcher.service.js';

@Module({
  providers: [
    OperatorUnpausedListenerInitService,
    WatermarkService,
    OperatorUnpausedWatcherService,
    OperatorUnpausedBackfillService,
    OperatorUnpausedQueueService,
  ],
})
export class OperatorUnpausedEventListenerModule {}
