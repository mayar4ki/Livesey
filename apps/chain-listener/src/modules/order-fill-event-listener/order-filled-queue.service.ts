import { Injectable } from '@nestjs/common';

import { createOrderFilledQueue, type OrderFilledEventsLog } from '@acme/queue';

@Injectable()
export class OrderFilledQueueService {
  private readonly queue = createOrderFilledQueue();

  async enqueueLog(log: OrderFilledEventsLog, mode: 'live' | 'backfill') {
    const jobId = `${log.transactionHash}:${log.logIndex ?? 0}`;
    await this.queue.add(
      'order-filled',
      { log, mode },
      {
        removeOnFail: false,
        jobId,
      },
    );
  }

  async enqueueLogs(logs: OrderFilledEventsLog[], mode: 'live' | 'backfill') {
    for (const log of logs) {
      await this.enqueueLog(log, mode);
    }
  }
}

