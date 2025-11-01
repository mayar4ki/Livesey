import { Address } from 'viem';
import { redis, ensureConnected } from './client';

const QUEUE_NAME = 'queue:verification';

/**
 * Create a new verification task and add to queue
 */
export async function createVerificationTask(data: { contractAddress: Address; chainId: number; args: any[] }) {
  try {
    await ensureConnected();

    const contractAddress = data.contractAddress;
    const chainId = data.chainId;

    const task = {
      contractAddress,
      chainId,
      status: 'pending' as const,
      args: data.args,
    };

    // Store task in Redis with key: task:{contractAddress}
    await redis.set(`task:${chainId}:${contractAddress}`, JSON.stringify(task));

    // Add tx to queue (using Redis List)
    await redis.lPush(QUEUE_NAME, `${chainId}:${contractAddress}`);

    console.log(`✅ new task: task:${chainId}:${contractAddress}`);
    return task;
  } catch (error) {
    console.error('Error creating verification task:', error);
    throw error;
  }
}

/**
 * Get verification task by chainId and tx
 */
export async function getVerificationTask(chainId: number, contractAddress: Address) {
  try {
    await ensureConnected();
    const data = await redis.get(`task:${chainId}:${contractAddress}`);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting verification task:', error);
    return null;
  }
}
