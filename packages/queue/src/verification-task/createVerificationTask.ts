import { Address } from "viem";
import { redis, ensureConnected, QUEUE_NAME } from "../client";
import { VerificationTask } from "./types";

/**
 * Create a new verification task and add to queue
 */
export async function createVerificationTask(data: {
  contractAddress: Address;
  chainId: number;
  walletAddress: Address;
  args: any[];
}) {
  try {
    await ensureConnected();

    const { contractAddress, chainId, walletAddress, args } = data;

    const task: VerificationTask = {
      contractAddress,
      chainId,
      walletAddress,
      args,
      status: "pending",
    };

    // Store task in Redis with key: task:{contractAddress}
    await redis.set(`task:${chainId}:${contractAddress}`, JSON.stringify(task));

    // Add tx to queue (using Redis List)
    await redis.lPush(QUEUE_NAME, `${chainId}:${contractAddress}`);

    console.log(
      `✅ new task: task:${chainId}:${contractAddress} for wallet: ${walletAddress}`
    );
    return task;
  } catch (error) {
    console.error("Error creating verification task:", error);
    throw error;
  }
}
