import { Module } from '@nestjs/common';

import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import { OperatorAddedBackfillService } from './operator-added-backfill.service.js';
import { OperatorAddedListenerInitService } from './operator-added-listener-init.service.js';
import { OperatorAddedQueueService } from './operator-added-queue.service.js';
import { OperatorAddedWatcherService } from './operator-added-watcher.service.js';

@Module({
  providers: [
    OperatorAddedListenerInitService,
    WatermarkService,
    OperatorAddedWatcherService,
    OperatorAddedBackfillService,
    OperatorAddedQueueService,
  ],
})
export class OperatorAddedListenerModule {}
