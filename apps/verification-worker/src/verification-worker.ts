import { prisma } from "@acme/db";
import { consumeTask } from "@acme/queue";
import { closeRedisConnection } from "@acme/queue/client";
import { handleContractVerification } from "./handlers/contract-verification-handler.js";
import { validateEnv } from "./schemas/env-validation-schema.js";

// Validate environment variables before starting
validateEnv(process.env);

/**
 * Start the worker
 */
async function startWorker() {
  console.log("🚀 Starting verification worker...");
  console.log("✅ Connected to Redis");
  console.log("👂 Waiting for tasks in queue...");
  console.log("Press CTRL+C to exit");

  try {
    // Main worker loop
    while (true) {
      try {
        // Consume task from Redis queue (blocks until task available)
        const result = await consumeTask(0); // 0 = wait forever

        if (result) {
          await handleContractVerification(result);
        }
      } catch (error) {
        console.error("Error processing task:", error);
        // Continue processing other tasks
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait before retrying
      }
    }
  } catch (error) {
    console.error("Worker error:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
async function shutdown() {
  console.log("\nShutting down worker...");
  await closeRedisConnection();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Start the worker
startWorker().catch((error) => {
  console.error("Failed to start worker:", error);
  process.exit(1);
});
