import { Address } from "viem";
import { redis, ensureConnected } from "../client";
import { VerificationTask } from "./types";
import { getVerificationTask } from "./get";

/**
 * Update verification task status
 */
export async function updateVerificationTask(
  chainId: number,
  contractAddress: Address,
  updates: {
    status: "pending" | "processing" | "completed" | "failed";
  }
): Promise<VerificationTask> {
  try {
    await ensureConnected();
    const task = await getVerificationTask(chainId, contractAddress);
    if (!task) {
      throw new Error(`Task ${contractAddress} on chain ${chainId} not found`);
    }

    const updated: VerificationTask = {
      ...task,
      status: updates.status,
    };

    await redis.set(
      `task:${chainId}:${contractAddress}`,
      JSON.stringify(updated)
    );
    console.log(
      `⚠️ updated: task:${chainId}:${contractAddress} status to: ${updates.status}`
    );
    return updated;
  } catch (error) {
    console.error(
      "❌ error updating: task:${chainId}:${contractAddress}",
      error
    );
    throw error;
  }
}
