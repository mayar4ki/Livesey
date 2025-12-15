import { Injectable } from '@nestjs/common';

import { createTokenCreatedQueue, type TokenCreatedEventsLog } from '@acme/queue';
import { serializeBigInt } from '@acme/shared';
import type { FactoryAbi } from '@acme/smart-contract';
import type { WatchContractEventOnLogsParameter } from 'viem';

type RawTokenCreatedLog = WatchContractEventOnLogsParameter<typeof FactoryAbi, 'TokenCreated'>[number];

@Injectable()
export class TokenCreatedQueueService {
  private readonly queue = createTokenCreatedQueue();

  async enqueueLog(log: RawTokenCreatedLog, mode: 'live' | 'backfill') {
    const jobId = `${log.transactionHash}+${log.logIndex ?? 0}`;
    const serializedLog = serializeBigInt(log) as TokenCreatedEventsLog;
    await this.queue.add(
      'token-created',
      { log: serializedLog, mode },
      {
        removeOnFail: false,
        jobId,
      },
    );
  }

  async enqueueLogs(logs: RawTokenCreatedLog[], mode: 'live' | 'backfill') {
    for (const log of logs) {
      await this.enqueueLog(log, mode);
    }
  }
}
