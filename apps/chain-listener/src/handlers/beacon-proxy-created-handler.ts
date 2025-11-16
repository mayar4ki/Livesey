import { FactoryAbi } from "@acme/smart-contract";
import { WatchContractEventOnLogsParameter } from "viem";

import { queueVerificationTasks } from "../helpers/queue-verification-tasks.js";
import { storeDeployedTokens } from "../helpers/store-deployed-tokens.js";

import { envValidationSchema } from "../schemas/env-validation-schema.js";
import { validateBeaconProxyCreatedEventLogs } from "../schemas/event-args-validation-schema.js";
import {
  transformToQueueVerificationTaskData,
  transformToStoreDeployedTokenData,
} from "../utils/transform-validated-logs.js";

// Validate and parse environment variables
const env = envValidationSchema.parse(process.env);

type BeaconProxyCreatedEventsLog = WatchContractEventOnLogsParameter<
  typeof FactoryAbi,
  "BeaconProxyCreated"
>;

/**
 * Handle BeaconProxyCreated events
 * Processes multiple events and stores them in a single database transaction
 */
export async function handleBeaconProxyCreatedEvents(
  logs: BeaconProxyCreatedEventsLog
) {
  // Log each token
  for (const log of logs) {
    console.log(
      `📢 BeaconProxyCreated event detected:\n` +
        `  Contract: ${log?.args?.createdBeaconProxy}\n` +
        `  Deployer: ${log?.args?.deployer}\n` +
        `  Name: ${log?.args?.name}\n` +
        `  Symbol: ${log?.args?.symbol}\n` +
        `  Asset Ref Hash: ${log?.args?.assetRefHash}\n` +
        `  Total Supply: ${log?.args?.totalSupply}\n` +
        `  Transaction: ${log?.transactionHash}\n` +
        `  Block: ${log?.blockNumber}`
    );
  }

  // Validate and filter logs
  const validLogs = validateBeaconProxyCreatedEventLogs(logs);

  try {
    // 1. Store all tokens in a single database transaction
    const storeTokenData = transformToStoreDeployedTokenData(
      validLogs,
      env.CHAIN_ID
    );
    await storeDeployedTokens(storeTokenData);
    console.log(`✅ successfully stored: ${validLogs.length} tokens`);

    // 2. Queue verification tasks for all tokens
    const verificationTaskData = transformToQueueVerificationTaskData(
      validLogs,
      env.CHAIN_ID
    );
    await queueVerificationTasks(verificationTaskData);
    console.log(`✅ successfully processed: ${validLogs.length} tokens`);

    //
  } catch (error) {
    console.error(
      `❌ Error storing deployed tokens in database:`,
      error instanceof Error ? error.message : error
    );
    // Don't throw - continue listening to other events
  }
}
