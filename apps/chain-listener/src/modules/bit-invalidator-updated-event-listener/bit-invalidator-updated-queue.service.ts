import { Injectable } from '@nestjs/common';

import { createBitInvalidatorUpdatedQueue, type BitInvalidatorUpdatedEventsLog } from '@acme/queue';
import { serializeBigInt } from '@acme/shared';

@Injectable()
export class BitInvalidatorUpdatedQueueService {
  private readonly queue = createBitInvalidatorUpdatedQueue();

  async enqueueLog(log: BitInvalidatorUpdatedEventsLog, mode: 'live' | 'backfill') {
    const jobId = `${log.transactionHash}+${log.logIndex ?? 0}`;
    const serializedLog = serializeBigInt(log) as BitInvalidatorUpdatedEventsLog;
    await this.queue.add(
      'bit-invalidator-updated',
      { log: serializedLog, mode },
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

