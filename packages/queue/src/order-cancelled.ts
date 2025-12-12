import { ONEINCH_LIMIT_ORDER_PROTOCOL_ABI } from "@acme/shared";
import { Queue, type QueueOptions } from "bullmq";
import { WatchContractEventOnLogsParameter } from "viem";

export type OrderCancelledEventsLog = WatchContractEventOnLogsParameter<
  typeof ONEINCH_LIMIT_ORDER_PROTOCOL_ABI,
  "OrderCancelled"
>[number];

export type OrderCancelledJob = {
  log: OrderCancelledEventsLog;
  mode: "live" | "backfill";
};

export const orderCancelledQueueName = "order-cancelled";

export function createOrderCancelledQueue(
  options: Omit<QueueOptions, "connection"> = {}
) {
  return new Queue<OrderCancelledJob>(orderCancelledQueueName, {
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
