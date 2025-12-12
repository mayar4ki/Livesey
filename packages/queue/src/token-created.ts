import { FactoryAbi } from "@acme/smart-contract";
import { Queue, type QueueOptions } from "bullmq";
import { WatchContractEventOnLogsParameter } from "viem";

export type TokenCreatedEventsLog = WatchContractEventOnLogsParameter<
  typeof FactoryAbi,
  "TokenCreated"
>[number];

export type TokenCreatedJob = {
  log: TokenCreatedEventsLog;
  mode: "live" | "backfill";
};

export const tokenCreatedQueueName = "token-created";

export function createTokenCreatedQueue(
  options: Omit<QueueOptions, "connection"> = {}
) {
  return new Queue<TokenCreatedJob>(tokenCreatedQueueName, {
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
