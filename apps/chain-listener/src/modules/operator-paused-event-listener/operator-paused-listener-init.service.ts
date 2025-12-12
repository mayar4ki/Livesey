import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { OperatorPausedBackfillService } from './operator-paused-backfill.service.js';
import { OperatorPausedWatcherService } from './operator-paused-watcher.service.js';

@Injectable()
export class OperatorPausedListenerInitService implements OnModuleInit {
  private readonly logger = new Logger(OperatorPausedListenerInitService.name);

  constructor(
    private readonly watcherService: OperatorPausedWatcherService,
    private readonly backfillService: OperatorPausedBackfillService,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting OperatorPaused listener');

    await this.backfillService.reconcile();
    this.watcherService.init();
    this.backfillService.initiateContinuousReconciliation();

    this.logger.log('OperatorPaused listener ready');
  }
}

