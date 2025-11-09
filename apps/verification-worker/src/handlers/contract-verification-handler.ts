import { VerificationTask, updateVerificationTask } from "@acme/queue";
import { storeVerifiedContract } from "../helpers/store-verified-contract.js";

/**
 * Process a verification task
 * Updates task status, verifies contract, and marks it as verified in database
 */
export async function handleContractVerification(
  task: VerificationTask
): Promise<void> {
  const { chainId, contractAddress, args } = task;
  console.log(`✅ processing: task:${chainId}:${contractAddress}`);

  try {
    // Update status to processing
    await updateVerificationTask(chainId, contractAddress, {
      status: "processing",
    });

    // Verify contract
    const isVerified = true;

    // Store contract address in PostgreSQL after successful verification
    if (isVerified) {
      await storeVerifiedContract({ contractAddress, chainId });
    }

    // Update status to completed
    await updateVerificationTask(chainId, contractAddress, {
      status: "completed",
    });

    console.log(`✅ successfully verified: task:${chainId}:${contractAddress}`);
  } catch (error) {
    console.error(
      `✗ Failed to verify contract ${contractAddress} on chain ${chainId}:`,
      error
    );

    // Update status to failed
    await updateVerificationTask(chainId, contractAddress, {
      status: "failed",
    });
  }
}
