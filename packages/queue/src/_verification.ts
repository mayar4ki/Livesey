import { Queue, type QueueOptions } from "bullmq";

import { Address } from "viem";

import { ERC20ImplementationAbi } from "@acme/smart-contract";
import { WriteContractParameters } from "viem";

export type TokenCreatedArgs = WriteContractParameters<
  typeof ERC20ImplementationAbi,
  "initialize"
>["args"];

export type VerificationTask = {
  token: Address;
  args: TokenCreatedArgs;
};

export type VerificationTaskJob = {
  chainId: number;
  token: VerificationTask;
  mode?: "live" | "backfill";
};

export const verificationQueueName = "verification";

export function createVerificationQueue(
  options: Omit<QueueOptions, "connection"> = {}
) {
  return new Queue<VerificationTaskJob>(verificationQueueName, {
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
