import { prepareVerificationFiles } from "./prepare-verification-files.js";

/**
 * Create FormData for Sourcify API submission
 */
export function prepareVerificationData(
  chainId: number,
  contractAddress: string,
  contractName: string,
  sourceName: string,
  contractArgs?: string[],
): FormData {
  const formData = new FormData();

  formData.append("chain", chainId.toString());
  formData.append("address", contractAddress);

  // Add constructor arguments if provided
  // Note: Sourcify doesn't require constructor arguments for verification.
  // This is included for potential compatibility with other verification services
  // or future Sourcify features. Format: JSON array of ABI-encoded strings.
  if (contractArgs && contractArgs.length > 0) {
    formData.append("constructorArgs", JSON.stringify(contractArgs));
  }

  const files = prepareVerificationFiles(contractName, sourceName);

  // Add files as blobs with their paths
  for (const file of files) {
    const blob = new Blob([file.content], { type: "text/plain" });
    formData.append("files", blob, file.path);
  }

  return formData;
}
