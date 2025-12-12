import { Injectable } from '@nestjs/common';

import { createTokenCreatedQueue, type TokenCreatedEventsLog } from '@acme/queue';

@Injectable()
export class TokenCreatedQueueService {
  private readonly queue = createTokenCreatedQueue();

  async enqueueLog(log: TokenCreatedEventsLog, mode: 'live' | 'backfill') {
    const jobId = `${log.transactionHash}:${log.logIndex ?? 0}`;
    await this.queue.add(
      'token-created',
      { log, mode },
      {
        removeOnFail: false,
        jobId,
      },
    );
  }

  async enqueueLogs(logs: TokenCreatedEventsLog[], mode: 'live' | 'backfill') {
    for (const log of logs) {
      await this.enqueueLog(log, mode);
    }
  }
}

