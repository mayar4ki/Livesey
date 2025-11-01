#!/usr/bin/env node

/**
 * Redis Worker for processing token verification tasks
 *
 * This worker consumes tasks from the Redis queue and processes them.
 * Run with: yarn tsx scripts/verification-worker.ts
 */
import { closeRedisConnection } from '@/lib/redis/client';
import { consumeTask, updateVerificationTask } from '@/lib/redis/worker';
import { Address } from 'viem';
import { sepolia, mainnet } from 'viem/chains';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Get network name from chainId
 */
function getNetworkName(chainId: number): string {
  switch (chainId) {
    case sepolia.id:
      return 'sepolia';
    case mainnet.id:
      return 'mainnet';
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
}

/**
 * Process a verification task
 */
async function processVerificationTask(chainId: number, contractAddress: Address, task: any): Promise<void> {
  console.log(`✅ processing: task:${chainId}:${contractAddress}`);

  try {
    // Update status to processing
    await updateVerificationTask(chainId, contractAddress, {
      status: 'processing',
    });

    // Verify contract
    await runVerificationCommand({ contractAddress, chainId, args: task.args || [] });

    // Update status to completed
    await updateVerificationTask(chainId, contractAddress, {
      status: 'completed',
    });

    console.log(`✅ successfully verified: task:${chainId}:${contractAddress}`);
  } catch (error) {
    console.error(`✗ Failed to verify contract ${contractAddress} on chain ${chainId}:`, error);

    // Update status to failed
    await updateVerificationTask(chainId, contractAddress, {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Verify contract using Hardhat
 */
async function runVerificationCommand({ contractAddress, chainId, args }: { contractAddress: Address; chainId: number; args: any[] }): Promise<void> {
  // Get network name
  const networkName = getNetworkName(chainId);

  // Path to token-smart-contract package
  const contractPackagePath = path.join(process.cwd(), '..', '..', 'packages', 'token-smart-contract');

  // Build Hardhat verify command with constructor args
  // Format: hardhat verify --network <network> <contractAddress> <arg1> <arg2> ...
  const argsString =
    args.length > 0
      ? args
          .map((arg) => {
            // Handle different argument types
            if (typeof arg === 'string') {
              // Quote strings with spaces
              return arg.includes(' ') ? `"${arg}"` : arg;
            }
            if (typeof arg === 'bigint') {
              return arg.toString();
            }
            return String(arg);
          })
          .join(' ')
      : '';

  const verifyCommand = `dotenv -e .env.${networkName} -- hardhat verify --force --network ${networkName} ${contractAddress} ${argsString ? `${argsString}` : ''}`;

  console.log(`🚀Executing Hardhat verify command: ${verifyCommand}`);

  try {
    const { stdout, stderr } = await execAsync(verifyCommand, {
      cwd: contractPackagePath,
    });

    console.log('Verification output:', stdout);
    if (stderr) {
      console.warn('Verification warnings:', stderr);
    }

    // Check if verification was successful
    if (stdout.includes('Successfully verified') || stdout.includes('already verified')) {
      console.log(`✅ Contract verified successfully: ${contractAddress}`);
    } else {
      throw new Error(`❌ Verification may have failed. Output: ${stdout}`);
    }
  } catch (error: any) {
    // Check if it's already verified (non-fatal)
    if (error.stdout?.includes('already verified') || error.stderr?.includes('already verified')) {
      console.log(`✓ Contract already verified: ${contractAddress}`);
      return;
    }

    throw new Error(`Hardhat verify failed: ${error.message}\nStdout: ${error.stdout}\nStderr: ${error.stderr}`);
  }
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
          const { chainId, contractAddress, task } = result;
          await processVerificationTask(chainId, contractAddress, task);
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
