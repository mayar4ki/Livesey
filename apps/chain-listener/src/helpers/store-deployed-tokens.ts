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
  totalSupply: string;
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
    const SEED_DATA_KEY = getSeedDataKey(token.assetRefHash);
    try {
      const seedValue = await redis.get(SEED_DATA_KEY);
      if (!seedValue) {
        throw new Error(
          `Seed data not found in Redis for assetRefHash: ${token.assetRefHash}`
        );
      }
      seedDataMap.set(token.assetRefHash, JSON.parse(seedValue));
      // Delete seed from Redis after retrieving (cleanup)
      await redis.del(SEED_DATA_KEY);
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
      const { contractAddress, chainId, ...rest } = token;

      return prisma.deployedToken.upsert({
        where: {
          contractAddress_chainId: {
            contractAddress,
            chainId,
          },
        },
        update: {
          // Update if it already exists (shouldn't happen, but handle gracefully)
          ...rest,
          seedData: {
            upsert: {
              create: { seedData },
              update: { seedData },
            },
          },
        },
        create: {
          contractAddress,
          chainId,
          ...rest,
          seedData: { create: { seedData } },
        },
      });
    })
  );

  console.log(
    `✅ Stored ${tokens.length} deployed token(s) in PostgreSQL in a single transaction`
  );
}
