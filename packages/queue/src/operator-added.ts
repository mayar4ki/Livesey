import { FactoryAbi } from "@acme/smart-contract";
import { Queue, type QueueOptions } from "bullmq";
import { WatchContractEventOnLogsParameter } from "viem";

export type OperatorAddedEventsLog = WatchContractEventOnLogsParameter<
  typeof FactoryAbi,
  "OperatorAdded"
>[number];

export type OperatorAddedJob = {
  log: OperatorAddedEventsLog;
  mode: "live" | "backfill";
};

export const operatorAddedQueueName = "operator-added";

export function createOperatorAddedQueue(
  options: Omit<QueueOptions, "connection"> = {}
) {
  return new Queue<OperatorAddedJob>(operatorAddedQueueName, {
    connection: {
      url: process.env.REDIS_URL,
    },
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 5_000,
      },
      removeOnComplete: true,
    },
    ...options,
  });
}
