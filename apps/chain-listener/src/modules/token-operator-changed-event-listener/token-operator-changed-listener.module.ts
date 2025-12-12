import { Module } from '@nestjs/common';

import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import { TokenOperatorChangedBackfillService } from './token-operator-changed-backfill.service.js';
import { TokenOperatorChangedListenerInitService } from './token-operator-changed-listener-init.service.js';
import { TokenOperatorChangedQueueService } from './token-operator-changed-queue.service.js';
import { TokenOperatorChangedWatcherService } from './token-operator-changed-watcher.service.js';

@Module({
  providers: [
    TokenOperatorChangedListenerInitService,
    WatermarkService,
    TokenOperatorChangedWatcherService,
    TokenOperatorChangedBackfillService,
    TokenOperatorChangedQueueService,
  ],
})
export class TokenOperatorChangedEventListenerModule {}
