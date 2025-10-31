#!/usr/bin/env node

/**
 * Redis Worker for processing token verification tasks
 *
 * This worker consumes tasks from the Redis queue and processes them.
 * Run with: yarn tsx scripts/verification-worker.ts
 */
import { closeRedisConnection } from '@/lib/redis/client';
import { consumeTask, updateVerificationTask } from '@/lib/redis/worker';

/**
 * Process a verification task
 */
async function processVerificationTask(chainId: number, tx: string, task: any): Promise<void> {
  console.log(`Processing verification task for contract: ${task.contractAddress} on chain ${task.chainId}`);

  try {
    // Update status to processing
    await updateVerificationTask(chainId, tx, {
      status: 'processing',
    });

    // TODO: Implement actual verification logic here
    // This is where you would:
    // 1. Call Etherscan API or similar to verify the contract
    // 2. Submit source code, compiler version, etc.
    // 3. Wait for verification result

    // Simulate verification process (replace with actual implementation)
    await simulateVerification(task);

    // Update status to completed
    await updateVerificationTask(chainId, tx, {
      status: 'completed',
    });

    console.log(`✓ Successfully verified contract: ${tx} on chain ${chainId}`);
  } catch (error) {
    console.error(`✗ Failed to verify contract ${tx} on chain ${chainId}:`, error);

    // Update status to failed
    await updateVerificationTask(chainId, tx, {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Simulate verification process (replace with actual implementation)
 */
async function simulateVerification(task: any): Promise<void> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 10 * 1000));

  // For now, just simulate success
  console.log(`Simulated verification for ${task.tx} on chain ${task.chainId}`);
}

/**
 * Start the worker
 */
async function startWorker() {
  console.log('Starting verification worker...');
  console.log('Connected to Redis');
  console.log('Waiting for tasks in queue...');
  console.log('Press CTRL+C to exit');

  try {
    // Main worker loop
    while (true) {
      try {
        // Consume task from Redis queue (blocks until task available)
        const result = await consumeTask(0); // 0 = wait forever

        if (result) {
          const { chainId, tx, task } = result;
          await processVerificationTask(chainId, tx, task);
        }
      } catch (error) {
        console.error('Error processing task:', error);
        // Continue processing other tasks
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait before retrying
      }
    }
  } catch (error) {
    console.error('Worker error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down worker...');
  await closeRedisConnection();
  process.exit(0);
});

// Start the worker
startWorker().catch((error) => {
  console.error('Failed to start worker:', error);
  process.exit(1);
});
