import { runVerificationCommand } from "./stages/verification-command";
import { storeVerifiedContract } from "./stages/store-verified-contract";

import {
  updateVerificationTask,
  consumeTask,
  VerificationTask,
} from "@acme/queue";

import { closeRedisConnection } from "@acme/queue/client";
import { prisma } from "@acme/db";

/**
 * Process a verification task
 */
async function processVerificationTask(task: VerificationTask): Promise<void> {
  const { chainId, contractAddress, walletAddress, args } = task;
  console.log(
    `✅ processing: task:${chainId}:${contractAddress} for wallet: ${walletAddress}`
  );

  try {
    // Update status to processing
    await updateVerificationTask(chainId, contractAddress, {
      status: "processing",
    });

    // Verify contract
    const isVerified = await runVerificationCommand({
      contractAddress,
      chainId,
      args,
    });

    // Store contract address in PostgreSQL after successful verification
    if (isVerified) {
      await storeVerifiedContract({ contractAddress, chainId, walletAddress });
    }

    // Update status to completed
    await updateVerificationTask(chainId, contractAddress, {
      status: "completed",
    });

    console.log(`✅ successfully verified: task:${chainId}:${contractAddress}`);
  } catch (error) {
    console.error(
      `✗ Failed to verify contract ${contractAddress} on chain ${chainId}:`,
      error
    );

    // Update status to failed
    await updateVerificationTask(chainId, contractAddress, {
      status: "failed",
    });
  }
}

/**
 * Start the worker
 */
async function startWorker() {
  console.log("Starting verification worker...");
  console.log("Connected to Redis");
  console.log("Waiting for tasks in queue...");
  console.log("Press CTRL+C to exit");

  try {
    // Main worker loop
    while (true) {
      try {
        // Consume task from Redis queue (blocks until task available)
        const result = await consumeTask(0); // 0 = wait forever

        if (result) {
          await processVerificationTask(result);
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
process.on("SIGINT", async () => {
  console.log("\nShutting down worker...");
  await closeRedisConnection();
  await prisma.$disconnect();
  process.exit(0);
});

// Start the worker
startWorker().catch((error) => {
  console.error("Failed to start worker:", error);
  process.exit(1);
});
