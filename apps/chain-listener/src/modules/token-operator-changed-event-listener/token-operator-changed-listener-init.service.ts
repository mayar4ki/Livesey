import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { TokenOperatorChangedBackfillService } from './token-operator-changed-backfill.service.js';
import { TokenOperatorChangedWatcherService } from './token-operator-changed-watcher.service.js';

@Injectable()
export class TokenOperatorChangedListenerInitService implements OnModuleInit {
  private readonly logger = new Logger(TokenOperatorChangedListenerInitService.name);

  constructor(
    private readonly watcherService: TokenOperatorChangedWatcherService,
    private readonly backfillService: TokenOperatorChangedBackfillService,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting TokenNewOperatorAddress listener');

    await this.backfillService.reconcile();
    this.watcherService.init();
    this.backfillService.initiateContinuousReconciliation();

    this.logger.log('TokenNewOperatorAddress listener ready');
  }
}
