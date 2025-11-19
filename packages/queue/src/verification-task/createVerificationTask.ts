import { QUEUE_NAME, ensureConnected, redis } from "../client.js";
import { getVerificationTaskKey } from "../keys.js";
import { VerificationTask } from "./types.js";

/**
 * Create a new verification task and add to queue
 */
export async function createVerificationTask(data: {
  chainId: number;
  token: Omit<VerificationTask, "status">;
}) {
  try {
    await ensureConnected();

    const { token, chainId } = data;

    const task: VerificationTask = {
      ...token,
      status: "pending",
    };

    // Store task in Redis with key: task:{token}
    await redis.set(
      getVerificationTaskKey(chainId, token.token),
      JSON.stringify(task)
    );

    // Add tx to queue (using Redis List)
    await redis.lPush(QUEUE_NAME, `${chainId}:${token}`);

    console.log(`✅ new task: task:${chainId}:${token}`);
    return task;
  } catch (error) {
    console.error("Error creating verification task:", error);
    throw error;
  }
}
