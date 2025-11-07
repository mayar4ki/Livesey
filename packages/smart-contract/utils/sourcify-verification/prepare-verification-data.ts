import { Address } from "viem";

/**
 * Create FormData for Sourcify API submission
 */
export function prepareVerificationData(
  chainId: number,
  contractAddress: Address,
  files: { path: string; content: string }[],
): FormData {
  const formData = new FormData();

  formData.append("chain", chainId.toString());
  formData.append("address", contractAddress);

  // Add files as blobs with their paths
  for (const file of files) {
    const blob = new Blob([file.content], { type: "text/plain" });
    formData.append("files", blob, file.path);
  }

  return formData;
}
