import { redis, ensureConnected } from './client';

const QUEUE_NAME = 'queue:verification';

/**
 * Create a new verification task and add to queue
 */
export async function createVerificationTask(data: { tx: string; chainId: number }) {
  try {
    await ensureConnected();

    const tx = data.tx;
    const chainId = data.chainId;

    const task = {
      tx,
      chainId,
      status: 'pending' as const,
    };

    // Store task in Redis with key: task:{contractAddress}
    await redis.set(`task:${chainId}:${tx}`, JSON.stringify(task));

    // Add tx to queue (using Redis List)
    await redis.lPush(QUEUE_NAME, `${chainId}:${tx}`);

    console.log(`Created verification task for tx contract: task:${chainId}:${tx}`);
    return task;
  } catch (error) {
    console.error('Error creating verification task:', error);
    throw error;
  }
}

/**
 * Get verification task by chainId and tx
 */
export async function getVerificationTask(chainId: number, tx: string) {
  try {
    await ensureConnected();
    const data = await redis.get(`task:${chainId}:${tx}`);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting verification task:', error);
    return null;
  }
}
