import { Queue, type QueueOptions } from "bullmq";
import { WatchContractEventOnLogsParameter } from "viem";

import { FactoryAbi } from "@acme/smart-contract";

export type OperatorPausedEventsLog = WatchContractEventOnLogsParameter<
  typeof FactoryAbi,
  "OperatorPaused"
>[number];

export type OperatorPausedJob = {
  log: OperatorPausedEventsLog;
  mode: "live" | "backfill";
};

export const operatorPausedQueueName = "operator-paused";

export function createOperatorPausedQueue(
  options: Omit<QueueOptions, "connection"> = {}
) {
  return new Queue<OperatorPausedJob>(operatorPausedQueueName, {
    connection: {
      url: process.env.REDIS_URL,
    },
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: "fixed",
        delay: 5_000,
      },
      removeOnComplete: true,
    },
    ...options,
  });
}
