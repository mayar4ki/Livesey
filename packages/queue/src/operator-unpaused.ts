import { Queue, type QueueOptions } from 'bullmq';
import { WatchContractEventOnLogsParameter } from 'viem';

import { FactoryAbi } from '@acme/smart-contract';

export type OperatorUnpausedEventsLog = WatchContractEventOnLogsParameter<typeof FactoryAbi, 'OperatorUnpaused'>[number];

export type OperatorUnpausedJob = {
  log: OperatorUnpausedEventsLog;
  mode: 'live' | 'backfill';
};

export const operatorUnpausedQueueName = 'operator-unpaused';

export function createOperatorUnpausedQueue(options: QueueOptions = {}) {
  return new Queue<OperatorUnpausedJob>(operatorUnpausedQueueName, {
    connection: {
      url: process.env.REDIS_URL,
    },
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5_000,
      },
      removeOnComplete: true,
    },
    ...options,
  });
}
