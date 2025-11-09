import { Address } from "viem";
import { QUEUE_NAME, ensureConnected, redis } from "../client.js";
import { VerificationTask } from "./types.js";

/**
 * Create a new verification task and add to queue
 */
export async function createVerificationTask(data: {
  contractAddress: Address;
  chainId: number;
  args: any[];
}) {
  try {
    await ensureConnected();

    const { contractAddress, chainId, args } = data;

    const task: VerificationTask = {
      contractAddress,
      chainId,
      args,
      status: "pending",
    };

    // Store task in Redis with key: task:{contractAddress}
    await redis.set(`task:${chainId}:${contractAddress}`, JSON.stringify(task));

    // Add tx to queue (using Redis List)
    await redis.lPush(QUEUE_NAME, `${chainId}:${contractAddress}`);

    console.log(`✅ new task: task:${chainId}:${contractAddress}`);
    return task;
  } catch (error) {
    console.error("Error creating verification task:", error);
    throw error;
  }
}
