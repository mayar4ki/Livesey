import { FactoryAbi } from "@acme/smart-contract";
import { WatchContractEventOnLogsParameter } from "viem";

import { queueVerificationTasks } from "../helpers/queue-verification-tasks.js";
import { storeDeployedTokens } from "../helpers/store-deployed-tokens.js";
import { validateEventLogs } from "../helpers/validate-event-logs.js";
import { envValidationSchema } from "../schemas/env-validation-schema.js";

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
        `  Total Supply: ${log?.args?.totalSupply}\n` +
        `  Transaction: ${log?.transactionHash}\n` +
        `  Block: ${log?.blockNumber}`
    );
  }

  // Validate and filter logs
  const validLogs = validateEventLogs(logs);

  try {
    // Store all tokens in a single database transaction
    await storeDeployedTokens(
      validLogs.map(({ log, args }) => ({
        contractAddress: args.createdBeaconProxy,
        chainId: env.CHAIN_ID,
        deployerAddress: args.deployer,
        name: args.name,
        symbol: args.symbol,
        totalSupply: args.totalSupply,
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber
          ? BigInt(log.blockNumber.toString())
          : undefined,
      }))
    );

    // Queue verification tasks for all tokens
    await queueVerificationTasks(
      validLogs.map(({ args }) => ({
        contractAddress: args.createdBeaconProxy,
        chainId: env.CHAIN_ID,
        deployerAddress: args.deployer,
        name: args.name,
        symbol: args.symbol,
        totalSupply: args.totalSupply,
      }))
    );
  } catch (error) {
    console.error(
      `❌ Error storing deployed tokens in database:`,
      error instanceof Error ? error.message : error
    );
    // Don't throw - continue listening to other events
  }
}
