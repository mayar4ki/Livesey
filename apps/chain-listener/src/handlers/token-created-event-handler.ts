import { TokenCreatedEvent } from "src/types/index.js";
import { queueVerificationTasks } from "../helpers/queue-verification-tasks.js";
import { storeDeployedTokens } from "../helpers/store-deployed-tokens.js";
import { envValidationSchema } from "../schemas/env-validation-schema.js";
import { validateLog } from "../schemas/token-created-validation.js";

// Validate and parse environment variables
const env = envValidationSchema.parse(process.env);

/**
 * Handle TokenCreated events
 * Processes multiple events and stores them in a single database transaction
 */
export async function tokenCreatedEventHandler(log: TokenCreatedEvent) {
  // Log each token

  console.log(
    `📢 TokenCreated event detected:\n` +
      `  Token: ${log?.args?.token}\n` +
      `  Deployer: ${log?.args?.createdBy}\n` +
      `  Name: ${log?.args?.name}\n` +
      `  Symbol: ${log?.args?.symbol}\n` +
      `  Asset Ref Hash: ${log?.args?.assetRefHash}\n` +
      `  Total Supply: ${log?.args?.totalSupply}\n` +
      `  Transaction: ${log?.transactionHash}\n` +
      `  Block: ${log?.blockNumber}`
  );

  try {
    // Validate log
    const validLog = validateLog(log);

    // 1. Store all tokens in a single database transaction
    await storeDeployedTokens(validLog);

    // 2. Queue verification tasks for all tokens
    await queueVerificationTasks(validLog);

    //
  } catch (error) {
    console.error(
      `❌ Error storing deployed tokens in database:`,
      error instanceof Error ? error.message : error
    );
    // Don't throw - continue listening to other events
  }
}
