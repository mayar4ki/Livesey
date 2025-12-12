import { Module } from '@nestjs/common';

import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import { TokenCreatedBackfillService } from './token-created-backfill.service.js';
import { TokenCreatedListenerInitService } from './token-created-listener-init.service.js';
import { TokenCreatedQueueService } from './token-created-queue.service.js';
import { TokenCreatedWatcherService } from './token-created-watcher.service.js';

@Module({
  providers: [
    TokenCreatedListenerInitService,
    WatermarkService,
    TokenCreatedWatcherService,
    TokenCreatedBackfillService,
    TokenCreatedQueueService,
  ],
})
export class NewTokenCreatedEventListenerModule {}
