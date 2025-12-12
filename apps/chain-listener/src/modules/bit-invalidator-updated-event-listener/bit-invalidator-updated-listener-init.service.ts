import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { BitInvalidatorUpdatedBackfillService } from './bit-invalidator-updated-backfill.service.js';
import { BitInvalidatorUpdatedWatcherService } from './bit-invalidator-updated-watcher.service.js';

@Injectable()
export class BitInvalidatorUpdatedListenerInitService implements OnModuleInit {
  private readonly logger = new Logger(BitInvalidatorUpdatedListenerInitService.name);

  constructor(
    private readonly watcherService: BitInvalidatorUpdatedWatcherService,
    private readonly backfillService: BitInvalidatorUpdatedBackfillService,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting BitInvalidatorUpdated listener');

    await this.backfillService.reconcile();
    this.watcherService.init();
    this.backfillService.initiateContinuousReconciliation();

    this.logger.log('BitInvalidatorUpdated listener ready');
  }
}

