import { Address } from "viem";
import { ensureConnected, redis } from "../client.js";
import { getVerificationTaskKey } from "../keys.js";
import { getVerificationTask } from "./getVerificationTask.js";
import { VerificationTask } from "./types.js";

/**
 * Update verification task status
 */
export async function updateVerificationTask(
  chainId: number,
  token: Address,
  updates: Pick<VerificationTask, "status">
): Promise<VerificationTask> {
  try {
    await ensureConnected();
    const task = await getVerificationTask(chainId, token);
    if (!task) {
      throw new Error(`Task ${token} on chain ${chainId} not found`);
    }

    const updated: VerificationTask = {
      ...task,
      status: updates.status,
    };

    await redis.set(
      getVerificationTaskKey(chainId, token),
      JSON.stringify(updated)
    );
    console.log(
      `⚠️ updated: task:${chainId}:${token} status to: ${updates.status}`
    );
    return updated;
  } catch (error) {
    console.error("❌ error updating: task:${chainId}:${token}", error);
    throw error;
  }
}
