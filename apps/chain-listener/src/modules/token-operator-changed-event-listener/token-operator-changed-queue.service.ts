import { Injectable } from '@nestjs/common';

import { createTokenNewOperatorAddressQueue, type TokenNewOperatorAddressEventsLog } from '@acme/queue';

@Injectable()
export class TokenOperatorChangedQueueService {
  private readonly queue = createTokenNewOperatorAddressQueue();

  async enqueueLog(log: TokenNewOperatorAddressEventsLog, mode: 'live' | 'backfill') {
    const jobId = `${log.transactionHash}:${log.logIndex ?? 0}`;
    await this.queue.add(
      'token-new-operator-address',
      { log, mode },
      {
        removeOnFail: false,
        jobId,
      },
    );
  }

  async enqueueLogs(logs: TokenNewOperatorAddressEventsLog[], mode: 'live' | 'backfill') {
    for (const log of logs) {
      await this.enqueueLog(log, mode);
    }
  }
}
