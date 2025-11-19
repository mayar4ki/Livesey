import { VerificationTask, updateVerificationTask } from "@acme/queue";
import { verifyProxy } from "src/helpers/verify-proxy.js";
import { Address } from "viem";
import { storeVerifiedContract } from "../helpers/store-verified-contract.js";

/**
 * Process a verification task
 * Updates task status, verifies contract, and marks it as verified in database
 */
export async function handleContractVerification(
  task: VerificationTask,
  _chainId: string
): Promise<void> {
  const token = task.token as Address;
  const chainId = +_chainId;

  console.log(`✅ processing: task:${chainId}:${token}`);

  try {
    // Update status to processing
    await updateVerificationTask(+chainId, token, {
      status: "processing",
    });

    // Verify contract

    await verifyProxy(token, chainId.toString());

    // Store contract address in PostgreSQL after successful verification
    await storeVerifiedContract(token, chainId);

    // Update status to completed
    await updateVerificationTask(chainId, token, {
      status: "completed",
    });

    console.log(`✅ successfully verified: task:${chainId}:${token}`);
  } catch (error) {
    console.error(
      `✗ Failed to verify contract ${token} on chain ${chainId}:`,
      error
    );

    // Update status to failed
    await updateVerificationTask(chainId, token, {
      status: "failed",
    });
  }
}
