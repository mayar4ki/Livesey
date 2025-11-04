import { Address } from "viem";
import { redis, ensureConnected } from "../client.js";
import { VerificationTask } from "./types.js";

/**
 * Get verification task by chainId and tx
 */
export async function getVerificationTask(
  chainId: number,
  contractAddress: Address
): Promise<VerificationTask | null> {
  try {
    await ensureConnected();
    const data = await redis.get(`task:${chainId}:${contractAddress}`);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as VerificationTask;
  } catch (error) {
    console.error("Error getting verification task:", error);
    return null;
  }
}
