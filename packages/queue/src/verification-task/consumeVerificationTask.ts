import { Address } from "viem";
import { ensureConnected, QUEUE_NAME, redis } from "../client.js";
import { getVerificationTask } from "./getVerificationTask.js";
import { type VerificationTask } from "./types.js";

/**
 * Consume a task from the queue (for worker)
 * Blocks until a task is available
 */
export async function consumeVerificationTask(
  timeoutSeconds: number = 0
): Promise<{ task: VerificationTask; chainId: string } | null> {
  try {
    await ensureConnected();
    // BRPOP blocks until an item is available (timeout 0 = wait forever)
    // node-redis v5 brPop takes (keys: string[], timeout: number)
    // Returns { key: string, element: string } | null
    const result = await redis.brPop([QUEUE_NAME], timeoutSeconds);

    if (!result) {
      return null;
    }

    const [chainId, token] = result.element.split(":");
    const task = await getVerificationTask(Number(chainId), token as Address);

    if (!task) {
      console.warn(`❌ task not found: task:${chainId}:${token}`);
      return null;
    }

    return { task, chainId: chainId! };
  } catch (error) {
    console.error("Error consuming task:", error);
    throw error;
  }
}
