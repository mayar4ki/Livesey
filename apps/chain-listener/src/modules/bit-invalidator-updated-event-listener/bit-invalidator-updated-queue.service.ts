import { Injectable } from '@nestjs/common';

import { createBitInvalidatorUpdatedQueue, type BitInvalidatorUpdatedEventsLog } from '@acme/queue';

@Injectable()
export class BitInvalidatorUpdatedQueueService {
  private readonly queue = createBitInvalidatorUpdatedQueue();

  async enqueueLog(log: BitInvalidatorUpdatedEventsLog, mode: 'live' | 'backfill') {
    const jobId = `${log.transactionHash}:${log.logIndex ?? 0}`;
    await this.queue.add(
      'bit-invalidator-updated',
      { log, mode },
      {
        removeOnFail: false,
        jobId,
      },
    );
  }

  async enqueueLogs(logs: BitInvalidatorUpdatedEventsLog[], mode: 'live' | 'backfill') {
    for (const log of logs) {
      await this.enqueueLog(log, mode);
    }
  }
}

