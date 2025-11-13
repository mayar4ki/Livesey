import { prisma } from "@acme/db";
import { getSeedDataKey } from "@acme/queue";
import { ensureConnected, redis } from "@acme/queue/client";
import { Address } from "viem";

export type StoreDeployedTokenData = {
  contractAddress: Address;
  chainId: number;
  deployerAddress: Address;
  name: string;
  symbol: string;
  assetRefHash: string;
  totalSupply: bigint;
  transactionHash: string;
  blockNumber: bigint;
};

/**
 * Store multiple deployed tokens in PostgreSQL database with a single transaction
 * This ensures atomicity - either all tokens are stored or none
 * Also retrieves seed data from Redis if available
 */
export async function storeDeployedTokens(
  tokens: StoreDeployedTokenData[]
): Promise<void> {
  if (tokens.length === 0) {
    return;
  }

  await ensureConnected();

  // Retrieve seed data from Redis for all tokens (outside transaction)
  const seedDataMap = new Map<string, any>();

  for (const token of tokens) {
    const seedKey = getSeedDataKey(token.assetRefHash);
    try {
      const seedValue = await redis.get(seedKey);
      if (!seedValue) {
        throw new Error(
          `Seed data not found in Redis for assetRefHash: ${token.assetRefHash}`
        );
      }
      seedDataMap.set(token.assetRefHash, JSON.parse(seedValue));
      // Delete seed from Redis after retrieving (cleanup)
      await redis.del(seedKey);
      console.log(`✅ Retrieved seed data for token ${token.contractAddress}`);
    } catch (error) {
      console.error(
        `❌ Failed to retrieve seed data for ${token.assetRefHash}:`,
        error
      );
      throw new Error(
        `Cannot store token ${token.contractAddress}: seed data is required but not found in Redis for assetRefHash ${token.assetRefHash}`
      );
    }
  }

  // Store tokens with seed data in database transaction
  await prisma.$transaction(
    tokens.map((token) => {
      const seedData = seedDataMap.get(token.assetRefHash);

      return prisma.deployedToken.upsert({
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
          assetRefHash: token.assetRefHash,
          totalSupply: token.totalSupply.toString(),
          transactionHash: token.transactionHash,
          blockNumber: token.blockNumber,
          deployerAddress: token.deployerAddress,
          seedData: {
            upsert: {
              create: {
                seedData: seedData,
              },
              update: {
                seedData: seedData,
              },
            },
          },
        },
        create: {
          contractAddress: token.contractAddress,
          chainId: token.chainId,
          name: token.name,
          symbol: token.symbol,
          assetRefHash: token.assetRefHash,
          totalSupply: token.totalSupply.toString(),
          transactionHash: token.transactionHash,
          blockNumber: token.blockNumber,
          deployerAddress: token.deployerAddress,
          seedData: {
            create: {
              seedData: seedData,
            },
          },
        },
      });
    })
  );

  console.log(
    `✅ Stored ${tokens.length} deployed token(s) in PostgreSQL in a single transaction`
  );
}
