import { createVerificationTask } from "@acme/queue";
import { Address } from "viem";

export type QueueVerificationTaskData = {
  contractAddress: Address;
  chainId: number;
  deployerAddress: Address;
  name: string;
  symbol: string;
  totalSupply: bigint;
};

/**
 * Queue verification tasks for multiple deployed tokens
 * Each task is queued individually - failures don't affect other tasks
 */
export async function queueVerificationTasks(
  tokens: QueueVerificationTaskData[]
): Promise<void> {
  if (tokens.length === 0) {
    return;
  }

  const results = await Promise.allSettled(
    tokens.map(async (token) => {
      await createVerificationTask({
        contractAddress: token.contractAddress,
        chainId: token.chainId,
        args: [token.name, token.symbol, token.totalSupply.toString()],
      });

      console.log(
        `✅ Task queued: ${token.contractAddress} for verification (deployer: ${token.deployerAddress})`
      );
    })
  );

  // Log any failures
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      const token = tokens[index];
      console.error(
        `❌ Error queuing verification task for ${token?.contractAddress}:`,
        result.reason instanceof Error ? result.reason.message : result.reason
      );
    }
  });
}
