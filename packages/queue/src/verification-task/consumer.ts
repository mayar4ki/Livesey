import { Address } from "viem";
import { type VerificationTask } from "./types";
import { ensureConnected, QUEUE_NAME, redis } from "../client";
import { getVerificationTask } from "./get";

/**
 * Consume a task from the queue (for worker)
 * Blocks until a task is available
 */
export async function consumeTask(
  timeoutSeconds: number = 0
): Promise<VerificationTask | null> {
  try {
    await ensureConnected();
    // BRPOP blocks until an item is available (timeout 0 = wait forever)
    // node-redis v5 brPop takes (keys: string[], timeout: number)
    // Returns { key: string, element: string } | null
    const result = await redis.brPop([QUEUE_NAME], timeoutSeconds);

    if (!result) {
      return null;
    }

    const [chainId, contractAddress] = result.element.split(":");
    const task = await getVerificationTask(
      Number(chainId),
      contractAddress as Address
    );

    if (!task) {
      console.warn(`❌ task not found: task:${chainId}:${contractAddress}`);
      return null;
    }

    return task;
  } catch (error) {
    console.error("Error consuming task:", error);
    throw error;
  }
}
