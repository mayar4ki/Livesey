import { Queue, type QueueOptions } from "bullmq";
import { WatchContractEventOnLogsParameter } from "viem";

import { ONEINCH_LIMIT_ORDER_PROTOCOL_ABI } from "@acme/shared";

export type OrderFilledEventsLog = WatchContractEventOnLogsParameter<
  typeof ONEINCH_LIMIT_ORDER_PROTOCOL_ABI,
  "OrderFilled"
>[number];

export type OrderFilledJob = {
  log: OrderFilledEventsLog;
  mode: "live" | "backfill";
};

export const orderFilledQueueName = "order-filled";

export function createOrderFilledQueue(
  options: Omit<QueueOptions, "connection"> = {}
) {
  return new Queue<OrderFilledJob>(orderFilledQueueName, {
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
