import { Injectable } from '@nestjs/common';

import { createOperatorUnpausedQueue, type OperatorUnpausedEventsLog } from '@acme/queue';

@Injectable()
export class OperatorUnpausedQueueService {
  private readonly queue = createOperatorUnpausedQueue();

  async enqueueLog(log: OperatorUnpausedEventsLog, mode: 'live' | 'backfill') {
    const jobId = `${log.transactionHash}:${log.logIndex ?? 0}`;
    await this.queue.add(
      'operator-unpaused',
      { log, mode },
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

