import { Queue, type QueueOptions } from "bullmq";
import { WatchContractEventOnLogsParameter } from "viem";

import { ONEINCH_LIMIT_ORDER_PROTOCOL_ABI } from "@acme/shared";

export type BitInvalidatorUpdatedEventsLog = WatchContractEventOnLogsParameter<
  typeof ONEINCH_LIMIT_ORDER_PROTOCOL_ABI,
  "BitInvalidatorUpdated"
>[number];

export type BitInvalidatorUpdatedJob = {
  log: BitInvalidatorUpdatedEventsLog;
  mode: "live" | "backfill";
};

export const bitInvalidatorUpdatedQueueName = "bit-invalidator-updated";

export function createBitInvalidatorUpdatedQueue(
  options: Omit<QueueOptions, "connection"> = {}
) {
  return new Queue<BitInvalidatorUpdatedJob>(bitInvalidatorUpdatedQueueName, {
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
