import { prisma } from "@acme/db";
import { getSeedDataKey } from "@acme/queue";
import { ensureConnected, redis } from "@acme/queue/client";
import { envValidationSchema } from "../schemas/env-validation-schema";
import { ValidatedLog } from "../schemas/token-created-validation";

const env = envValidationSchema.parse(process.env);

/**
 * Store multiple deployed tokens in PostgreSQL database with a single transaction
 * This ensures atomicity - either all tokens are stored or none
 * Also retrieves seed data from Redis if available
 */
export async function storeDeployedTokens(log: ValidatedLog): Promise<void> {
  // const tokens = transformToStoreDeployedTokenData(log, env.CHAIN_ID);

  await ensureConnected();

  const token = log.args;

  // Retrieve seed data from Redis for all tokens (outside transaction)
  let seedData;

  const SEED_DATA_KEY = getSeedDataKey(token.assetRefHash);
  try {
    const seedValue = await redis.get(SEED_DATA_KEY);
    if (!seedValue) {
      throw new Error(
        `Seed data not found in Redis for assetRefHash: ${token.assetRefHash}`
      );
    }
    seedData = JSON.parse(seedValue);
    // Delete seed from Redis after retrieving (cleanup)
    await redis.del(SEED_DATA_KEY);
    console.log(`✅ Retrieved seed data for token ${token.token}`);
  } catch (error) {
    console.error(
      `❌ Failed to retrieve seed data for ${token.assetRefHash}:`,
      error
    );
    throw new Error(
      `Cannot store token ${token.token}: seed data is required but not found in Redis for assetRefHash ${token.assetRefHash}`
    );
  }

  // Store tokens with seed data in database transaction

  await prisma.token.upsert({
    where: {
      token_chainId: {
        token: token.token,
        chainId: env.CHAIN_ID,
      },
    },
    update: {
      // Update if it already exists (shouldn't happen, but handle gracefully)
      token: token.token,

      name: token.name,
      symbol: token.symbol,
      totalSupply: token.totalSupply.toString(),

      assetRefHash: token.assetRefHash,
      createdBy: token.createdBy,
      operator: token.operator,

      chainId: env.CHAIN_ID,
      transactionHash: log.transactionHash,
      blockNumber: log.blockNumber,

      seedData: {
        upsert: {
          create: { data: seedData },
          update: { data: seedData },
        },
      },
    },
    create: {
      token: token.token,

      name: token.name,
      symbol: token.symbol,
      totalSupply: token.totalSupply.toString(),

      assetRefHash: token.assetRefHash,
      createdBy: token.createdBy,
      operator: token.operator,

      chainId: env.CHAIN_ID,
      transactionHash: log.transactionHash,
      blockNumber: log.blockNumber,

      seedData: { create: { data: seedData } },
    },
  });

  console.log(`✅ Token ${token} Stored in db`);
}
