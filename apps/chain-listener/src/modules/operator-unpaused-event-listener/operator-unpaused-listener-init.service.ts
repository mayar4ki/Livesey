import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { OperatorUnpausedBackfillService } from './operator-unpaused-backfill.service.js';
import { OperatorUnpausedWatcherService } from './operator-unpaused-watcher.service.js';

@Injectable()
export class OperatorUnpausedListenerInitService implements OnModuleInit {
  private readonly logger = new Logger(OperatorUnpausedListenerInitService.name);

  constructor(
    private readonly watcherService: OperatorUnpausedWatcherService,
    private readonly backfillService: OperatorUnpausedBackfillService,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting OperatorUnpaused listener');

    await this.backfillService.reconcile();
    this.watcherService.init();
    this.backfillService.initiateContinuousReconciliation();

    this.logger.log('OperatorUnpaused listener ready');
  }
}

