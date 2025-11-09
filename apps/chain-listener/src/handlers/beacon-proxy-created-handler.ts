import { createVerificationTask } from "@acme/queue";
import { FactoryAbi } from "@acme/smart-contract";
import { WatchContractEventOnLogsParameter } from "viem";
import { z } from "zod";

import { envValidationSchema } from "../schemas/env-validation-schema.js";
import { beaconProxyCreatedEventArgsSchema } from "../schemas/event-args-validation-schema.js";

// Validate and parse environment variables
const env = envValidationSchema.parse(process.env);

/**
 * Handle BeaconProxyCreated event
 */

export async function handleBeaconProxyCreatedEvent(
  log: WatchContractEventOnLogsParameter<
    typeof FactoryAbi,
    "BeaconProxyCreated"
  >[number]
) {
  try {
    // Validate event arguments at runtime using Zod
    const validatedArgs = beaconProxyCreatedEventArgsSchema.parse(log.args);
    const { createdBeaconProxy, deployer, name, symbol, totalSupply } =
      validatedArgs;

    console.log(
      `📢 BeaconProxyCreated event detected:\n` +
        `  Contract: ${createdBeaconProxy}\n` +
        `  Deployer: ${deployer}\n` +
        `  Name: ${name}\n` +
        `  Symbol: ${symbol}\n` +
        `  Total Supply: ${totalSupply}\n` +
        `  Transaction: ${log.transactionHash}\n` +
        `  Block: ${log.blockNumber}`
    );

    // Push to verification queue
    await createVerificationTask({
      contractAddress: createdBeaconProxy,
      chainId: env.CHAIN_ID,
      walletAddress: deployer,
      args: [name, symbol, totalSupply.toString()],
    });

    console.log(
      `✅ Task queued: ${createdBeaconProxy} for verification (deployer: ${deployer})`
    );
  } catch (error) {
    // Handle Zod validation errors specifically
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      console.error(
        `❌ Event validation failed for transaction ${log.transactionHash}:`,
        errorMessages
      );
    } else {
      console.error(
        `❌ Error processing BeaconProxyCreated event:`,
        error instanceof Error ? error.message : error
      );
    }
    // Don't throw - continue listening to other events
  }
}
