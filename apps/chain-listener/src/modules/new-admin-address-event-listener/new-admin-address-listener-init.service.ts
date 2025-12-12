import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { NewAdminAddressBackfillService } from './new-admin-address-backfill.service.js';
import { NewAdminAddressWatcherService } from './new-admin-address-watcher.service.js';

@Injectable()
export class NewAdminAddressListenerInitService implements OnModuleInit {
  private readonly logger = new Logger(NewAdminAddressListenerInitService.name);

  constructor(
    private readonly watcherService: NewAdminAddressWatcherService,
    private readonly backfillService: NewAdminAddressBackfillService,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting NewAdminAddress listener');

    await this.backfillService.reconcile();
    this.watcherService.init();
    this.backfillService.initiateContinuousReconciliation();

    this.logger.log('NewAdminAddress listener ready');
  }
}
