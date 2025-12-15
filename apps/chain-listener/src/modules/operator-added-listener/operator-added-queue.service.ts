import { Injectable } from '@nestjs/common';

import { createOperatorAddedQueue, type OperatorAddedEventsLog } from '@acme/queue';
import { serializeBigInt } from '@acme/shared';

@Injectable()
export class OperatorAddedQueueService {
  private readonly queue = createOperatorAddedQueue();

  async enqueueLog(log: OperatorAddedEventsLog, mode: 'live' | 'backfill') {
    const jobId = `${log.transactionHash}+${log.logIndex ?? 0}`;
    const serializedLog = serializeBigInt(log) as OperatorAddedEventsLog;
    await this.queue.add(
      'operator-added',
      { log: serializedLog, mode },
      {
        removeOnFail: false,
        jobId,
      },
    );
  }

  async enqueueLogs(logs: OperatorAddedEventsLog[], mode: 'live' | 'backfill') {
    for (const log of logs) {
      await this.enqueueLog(log, mode);
    }
  }
}
