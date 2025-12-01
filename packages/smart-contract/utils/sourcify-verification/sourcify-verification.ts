import { prepareVerificationData } from "./prepare-verification-data.js";
import { submitVerificationRequest } from "./submit-verification-request.js";

export type VerifyContractSourcifyProps = {
  contractAddress: string;
  chainId: number;
  contractName: string;
  sourceName: string;
  contractArgs?: string[];
};

/**
 * Verify contract using Sourcify API
 */
export async function verifyContractSourcify({
  contractAddress,
  chainId,
  contractName,
  sourceName,
  contractArgs,
}: VerifyContractSourcifyProps): Promise<boolean> {
  console.log(
    `🔍 Verifying ${contractName} at ${contractAddress} via Sourcify...`,
  );

  try {
    const formData = prepareVerificationData(
      chainId,
      contractAddress,
      contractName,
      sourceName,
      contractArgs,
    );

    console.log(`📤 Submitting verification to Sourcify...`);
    await submitVerificationRequest(formData);
    console.log(`✅ Contract verified successfully: ${contractAddress} \n\n`);

    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.toLowerCase().includes("already verified")) {
        console.log(`✅ Contract already verified: ${contractAddress} \n\n`);
        return true;
      }

      if (error.cause) {
        console.error("Fetch error details:", error.cause);
      }
    }

    throw error;
  }
}
