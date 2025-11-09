import { prisma } from "@acme/db";
import { Address } from "viem";

export type StoreDeployedTokenData = {
  contractAddress: Address;
  chainId: number;
  deployerAddress: Address;
  name: string;
  symbol: string;
  totalSupply: bigint;
  transactionHash: string;
  blockNumber?: bigint;
};

/**
 * Store multiple deployed tokens in PostgreSQL database with a single transaction
 * This ensures atomicity - either all tokens are stored or none
 */
export async function storeDeployedTokens(
  tokens: StoreDeployedTokenData[]
): Promise<void> {
  if (tokens.length === 0) {
    return;
  }

  await prisma.$transaction(
    tokens.map((token) =>
      prisma.deployedToken.upsert({
        where: {
          contractAddress_chainId: {
            contractAddress: token.contractAddress,
            chainId: token.chainId,
          },
        },
        update: {
          // Update if it already exists (shouldn't happen, but handle gracefully)
          name: token.name,
          symbol: token.symbol,
          totalSupply: token.totalSupply.toString(),
          transactionHash: token.transactionHash,
          blockNumber: token.blockNumber,
          deployerAddress: token.deployerAddress,
          updatedAt: new Date(),
        },
        create: {
          contractAddress: token.contractAddress,
          chainId: token.chainId,
          name: token.name,
          symbol: token.symbol,
          totalSupply: token.totalSupply.toString(),
          transactionHash: token.transactionHash,
          blockNumber: token.blockNumber,
          deployerAddress: token.deployerAddress,
        },
      })
    )
  );

  console.log(
    `✅ Stored ${tokens.length} deployed token(s) in PostgreSQL in a single transaction`
  );
}
