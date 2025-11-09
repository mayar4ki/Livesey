import { closeRedisConnection } from "@acme/queue/client";
import { FactoryAbi } from "@acme/smart-contract";
import { Address, createPublicClient, http } from "viem";

import { handleBeaconProxyCreatedEvent } from "./handlers/beacon-proxy-created-handler.js";
import { getChain } from "./helpers/get-chain.js";
import { envValidationSchema } from "./schemas/env-validation-schema.js";

// Validate and parse environment variables
const env = envValidationSchema.parse(process.env);

/**
 * Start listening to blockchain events
 */
async function startListener() {
  console.log("🚀 Starting chain listener...");
  console.log(`📍 Factory Address: ${env.FACTORY_ADDRESS}`);
  console.log(`🔗 RPC URL: ${env.CHAIN_RPC_URL}`);
  console.log(`⛓️  Chain ID: ${env.CHAIN_ID}`);
  console.log("👂 Listening for BeaconProxyCreated events...\n");

  try {
    // Create viem public client

    const publicClient = createPublicClient({
      chain: getChain(env.CHAIN_ID),
      transport: http(env.CHAIN_RPC_URL),
    });

    const unwatch = publicClient.watchContractEvent({
      address: env.FACTORY_ADDRESS as Address,
      abi: FactoryAbi,
      eventName: "BeaconProxyCreated",
      onLogs: async (logs) => {
        for (const log of logs) {
          await handleBeaconProxyCreatedEvent(log);
        }
      },
    });

    console.log("✅ Event listener started successfully");
    console.log("Press CTRL+C to stop\n");

    // Keep the process alive
    return unwatch;
  } catch (error) {
    console.error("❌ Failed to start event listener:", error);
    throw error;
  }
}

/**
 * Handle graceful shutdown
 */
async function shutdown() {
  console.log("\n🛑 Shutting down chain listener...");
  await closeRedisConnection();
  process.exit(0);
}

// Handle graceful shutdown
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Start the listener
startListener().catch((error) => {
  console.error("❌ Failed to start chain listener:", error);
  process.exit(1);
});
