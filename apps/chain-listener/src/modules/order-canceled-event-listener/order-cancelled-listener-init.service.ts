import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { OrderCancelledBackfillService } from './order-cancelled-backfill.service.js';
import { OrderCancelledWatcherService } from './order-cancelled-watcher.service.js';

@Injectable()
export class OrderCancelledListenerInitService implements OnModuleInit {
  private readonly logger = new Logger(OrderCancelledListenerInitService.name);

  constructor(
    private readonly watcherService: OrderCancelledWatcherService,
    private readonly backfillService: OrderCancelledBackfillService,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting OrderCancelled listener');

    await this.backfillService.reconcile();
    this.watcherService.init();
    this.backfillService.initiateContinuousReconciliation();

    this.logger.log('OrderCancelled listener ready');
  }
}

