import { Injectable } from '@nestjs/common';

import { createOperatorPausedQueue, type OperatorPausedEventsLog } from '@acme/queue';
import { serializeBigInt } from '@acme/shared';

@Injectable()
export class OperatorPausedQueueService {
  private readonly queue = createOperatorPausedQueue();

  async enqueueLog(log: OperatorPausedEventsLog, mode: 'live' | 'backfill') {
    const jobId = `${log.transactionHash}+${log.logIndex ?? 0}`;
    const serializedLog = serializeBigInt(log) as OperatorPausedEventsLog;
    await this.queue.add(
      'operator-paused',
      { log: serializedLog, mode },
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
