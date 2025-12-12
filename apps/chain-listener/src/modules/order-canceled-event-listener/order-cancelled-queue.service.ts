import { Injectable } from '@nestjs/common';

import { createOrderCancelledQueue, type OrderCancelledEventsLog } from '@acme/queue';

@Injectable()
export class OrderCancelledQueueService {
  private readonly queue = createOrderCancelledQueue();

  async enqueueLog(log: OrderCancelledEventsLog, mode: 'live' | 'backfill') {
    const jobId = `${log.transactionHash}:${log.logIndex ?? 0}`;
    await this.queue.add(
      'order-cancelled',
      { log, mode },
      {
        removeOnFail: false,
        jobId,
      },
    );
  }

  async enqueueLogs(logs: OrderCancelledEventsLog[], mode: 'live' | 'backfill') {
    for (const log of logs) {
      await this.enqueueLog(log, mode);
    }
  }
}

