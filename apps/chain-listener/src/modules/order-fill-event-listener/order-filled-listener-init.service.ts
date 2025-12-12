import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { OrderFilledBackfillService } from './order-filled-backfill.service.js';
import { OrderFilledWatcherService } from './order-filled-watcher.service.js';

@Injectable()
export class OrderFilledListenerInitService implements OnModuleInit {
  private readonly logger = new Logger(OrderFilledListenerInitService.name);

  constructor(
    private readonly watcherService: OrderFilledWatcherService,
    private readonly backfillService: OrderFilledBackfillService,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting OrderFilled listener');

    await this.backfillService.reconcile();
    this.watcherService.init();
    this.backfillService.initiateContinuousReconciliation();

    this.logger.log('OrderFilled listener ready');
  }
}

