import { Address } from "viem";
import { submitVerificationRequest } from "./submit-verification-request.js";
import { prepareVerificationFiles } from "./prepare-verification-files.js";
import { prepareVerificationData } from "./prepare-verification-data.js";

export type VerifyContractSourcifyProps = {
  contractAddress: Address;
  chainId: number;
  contractName: string;
  sourceName: string;
};

/**
 * Verify contract using Sourcify API
 */
export async function verifyContractSourcify({
  contractAddress,
  chainId,
  contractName,
  sourceName,
}: VerifyContractSourcifyProps): Promise<boolean> {
  console.log(
    `🔍 Verifying ${contractName} at ${contractAddress} via Sourcify...`,
  );

  try {
    const files = prepareVerificationFiles(contractName, sourceName);
    const formData = prepareVerificationData(chainId, contractAddress, files);

    console.log(`📤 Submitting verification to Sourcify...`);
    await submitVerificationRequest(formData);
    console.log(`✅ Contract verified successfully: ${contractAddress}`);

    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.toLowerCase().includes("already verified")) {
        console.log(`✅ Contract already verified: ${contractAddress}`);
        return true;
      }

      if (error.cause) {
        console.error("Fetch error details:", error.cause);
      }
    }

    throw error;
  }
}
