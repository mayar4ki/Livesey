import { Address } from 'viem';
import { prisma } from '@/lib/prisma/client';

export type StoreVerifiedContractProps = {
  contractAddress: Address;
  chainId: number;
  walletAddress: Address;
};

/**
 * Store verified contract in PostgreSQL database and link it to the wallet address
 */
export async function storeVerifiedContract({ contractAddress, chainId, walletAddress }: StoreVerifiedContractProps): Promise<void> {
  // Find or create the Address record for the wallet
  const address = await prisma.address.upsert({
    where: { walletAddress: walletAddress },
    update: {
      verifiedContracts: {
        create: {
          contractAddress: contractAddress,
          chainId: chainId,
        },
      },
    },
    create: {
      walletAddress: walletAddress,
      verifiedContracts: {
        create: {
          contractAddress: contractAddress,
          chainId: chainId,
        },
      },
    },
  });

  console.log(`✅ Contract address stored in PostgreSQL: ${contractAddress} for wallet: ${walletAddress}`);
}
