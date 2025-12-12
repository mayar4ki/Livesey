import { Injectable } from '@nestjs/common';

import { createOperatorPausedQueue, type OperatorPausedEventsLog } from '@acme/queue';

@Injectable()
export class OperatorPausedQueueService {
  private readonly queue = createOperatorPausedQueue();

  async enqueueLog(log: OperatorPausedEventsLog, mode: 'live' | 'backfill') {
    const jobId = `${log.transactionHash}:${log.logIndex ?? 0}`;
    await this.queue.add(
      'operator-paused',
      { log, mode },
      {
        removeOnFail: false,
        jobId,
      },
    );
  }

  async enqueueLogs(logs: OperatorPausedEventsLog[], mode: 'live' | 'backfill') {
    for (const log of logs) {
      await this.enqueueLog(log, mode);
    }
  }
}
