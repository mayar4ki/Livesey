import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { OperatorAddedBackfillService } from './operator-added-backfill.service.js';
import { OperatorAddedWatcherService } from './operator-added-watcher.service.js';

@Injectable()
export class OperatorAddedListenerInitService implements OnModuleInit {
  private readonly logger = new Logger(OperatorAddedListenerInitService.name);

  constructor(
    private readonly watcherService: OperatorAddedWatcherService,
    private readonly backfillService: OperatorAddedBackfillService,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting OperatorAdded listener');

    await this.backfillService.reconcile();
    this.watcherService.init();
    this.backfillService.initiateContinuousReconciliation();

    this.logger.log('OperatorAdded listener ready');
  }
}
