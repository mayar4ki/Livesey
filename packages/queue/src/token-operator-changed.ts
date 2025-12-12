import { FactoryAbi } from "@acme/smart-contract";
import { Queue, type QueueOptions } from "bullmq";
import { WatchContractEventOnLogsParameter } from "viem";

export type TokenNewOperatorAddressEventsLog =
  WatchContractEventOnLogsParameter<
    typeof FactoryAbi,
    "TokenNewOperatorAddress"
  >[number];

export type TokenNewOperatorAddressJob = {
  log: TokenNewOperatorAddressEventsLog;
  mode: "live" | "backfill";
};

export const tokenNewOperatorAddressQueueName = "token-new-operator-address";

export function createTokenNewOperatorAddressQueue(
  options: Omit<QueueOptions, "connection"> = {}
) {
  return new Queue<TokenNewOperatorAddressJob>(
    tokenNewOperatorAddressQueueName,
    {
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
    }
  );
}
