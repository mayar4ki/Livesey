import { Module } from '@nestjs/common';

import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import { OperatorPausedBackfillService } from './operator-paused-backfill.service.js';
import { OperatorPausedListenerInitService } from './operator-paused-listener-init.service.js';
import { OperatorPausedQueueService } from './operator-paused-queue.service.js';
import { OperatorPausedWatcherService } from './operator-paused-watcher.service.js';

@Module({
  providers: [
    OperatorPausedListenerInitService,
    WatermarkService,
    OperatorPausedWatcherService,
    OperatorPausedBackfillService,
    OperatorPausedQueueService,
  ],
})
export class OperatorPausedEventListenerModule {}
