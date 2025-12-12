import { Module } from '@nestjs/common';

import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import { OperatorAddedBackfillService } from './operator-added-backfill.service.js';
import { OperatorAddedListenerInitService } from './operator-added-listener-init.service.js';
import { OperatorAddedWatcherService } from './operator-added-watcher.service.js';

@Module({
  providers: [
    OperatorAddedListenerInitService,
    WatermarkService,
    OperatorAddedWatcherService,
    OperatorAddedBackfillService,
  ],
})
export class OperatorAddedListenerModule {}
