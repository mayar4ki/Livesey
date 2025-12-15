import { Injectable } from '@nestjs/common';

import { createOperatorUnpausedQueue, type OperatorUnpausedEventsLog } from '@acme/queue';
import { serializeBigInt } from '@acme/shared';

@Injectable()
export class OperatorUnpausedQueueService {
  private readonly queue = createOperatorUnpausedQueue();

  async enqueueLog(log: OperatorUnpausedEventsLog, mode: 'live' | 'backfill') {
    const jobId = `${log.transactionHash}+${log.logIndex ?? 0}`;
    const serializedLog = serializeBigInt(log) as OperatorUnpausedEventsLog;
    await this.queue.add(
      'operator-unpaused',
      { log: serializedLog, mode },
      {
        removeOnFail: false,
        jobId,
      },
    );
  }

  async enqueueLogs(logs: OperatorUnpausedEventsLog[], mode: 'live' | 'backfill') {
    for (const log of logs) {
      await this.enqueueLog(log, mode);
    }
  }
}

