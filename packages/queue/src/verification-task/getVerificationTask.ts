import { Address } from "viem";
import { ensureConnected, redis } from "../client.js";
import { getVerificationTaskKey } from "../keys.js";
import { VerificationTask } from "./types.js";

/**
 * Get verification task by chainId and tx
 */
export async function getVerificationTask(
  chainId: number,
  token: Address
): Promise<VerificationTask | null> {
  try {
    await ensureConnected();
    const data = await redis.get(getVerificationTaskKey(chainId, token));
    if (!data) {
      return null;
    }
    return JSON.parse(data) as VerificationTask;
  } catch (error) {
    console.error("Error getting verification task:", error);
    return null;
  }
}
