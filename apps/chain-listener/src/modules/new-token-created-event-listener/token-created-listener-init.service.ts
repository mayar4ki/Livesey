import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { TokenCreatedBackfillService } from './token-created-backfill.service.js';
import { TokenCreatedWatcherService } from './token-created-watcher.service.js';

@Injectable()
export class TokenCreatedListenerInitService implements OnModuleInit {
  private readonly logger = new Logger(TokenCreatedListenerInitService.name);

  constructor(
    private readonly watcherService: TokenCreatedWatcherService,
    private readonly backfillService: TokenCreatedBackfillService,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting TokenCreated listener');

    await this.backfillService.reconcile();
    this.watcherService.init();
    this.backfillService.initiateContinuousReconciliation();

    this.logger.log('TokenCreated listener ready');
  }
}

