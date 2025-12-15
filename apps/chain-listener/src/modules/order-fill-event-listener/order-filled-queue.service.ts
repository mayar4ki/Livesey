import { Injectable } from '@nestjs/common';

import { createOrderFilledQueue, type OrderFilledEventsLog } from '@acme/queue';
import { serializeBigInt } from '@acme/shared';

@Injectable()
export class OrderFilledQueueService {
  private readonly queue = createOrderFilledQueue();

  async enqueueLog(log: OrderFilledEventsLog, mode: 'live' | 'backfill') {
    const jobId = `${log.transactionHash}+${log.logIndex ?? 0}`;
    const serializedLog = serializeBigInt(log) as OrderFilledEventsLog;
    await this.queue.add(
      'order-filled',
      { log: serializedLog, mode },
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

