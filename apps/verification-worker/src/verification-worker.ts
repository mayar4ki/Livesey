import { prisma } from "@acme/db";
import { verificationQueueName, type VerificationTaskJob } from "@acme/queue";
import { closeRedisConnection } from "@acme/queue/client";
import { Worker } from "bullmq";
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

  const worker = new Worker<VerificationTaskJob>(
    verificationQueueName,
    async (job) => {
      await handleContractVerification(job.data.token, job.data.chainId.toString());
    },
    {
      connection: { url: process.env.REDIS_URL },
      concurrency: 3,
    }
  );

  worker.on("failed", (job, err) => {
    console.error(
      `Verification job failed token=${job?.data?.token?.token ?? "unknown"}`,
      err
    );
  });
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
