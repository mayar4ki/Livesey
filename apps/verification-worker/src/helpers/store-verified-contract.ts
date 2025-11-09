import { prisma } from "@acme/db";
import { Address } from "viem";

export type StoreVerifiedContractProps = {
  contractAddress: Address;
  chainId: number;
};

/**
 * Mark deployed token as verified in PostgreSQL database
 * Updates the isVerified flag and sets verifiedAt timestamp
 */
export async function storeVerifiedContract({
  contractAddress,
  chainId,
}: StoreVerifiedContractProps): Promise<void> {
  // Update the deployed token to mark it as verified
  const updated = await prisma.deployedToken.updateMany({
    where: {
      contractAddress: contractAddress,
      chainId: chainId,
    },
    data: {
      verifiedAt: new Date(),
    },
  });

  if (updated.count === 0) {
    console.warn(
      `⚠️ Token not found in database: ${contractAddress} on chain ${chainId}. It may not have been deployed through the factory.`
    );
  } else {
    console.log(
      `✅ Token marked as verified in PostgreSQL: ${contractAddress}`
    );
  }
}
