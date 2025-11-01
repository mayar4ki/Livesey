import { Address } from 'viem';
import { getVerificationTask, VerificationTask } from '.';
import { redis, ensureConnected } from './client';

const QUEUE_NAME = 'queue:verification';

/**
 * Update verification task status
 */
export async function updateVerificationTask(
  chainId: number,
  contractAddress: Address,
  updates: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
  }
): Promise<VerificationTask> {
  try {
    await ensureConnected();
    const task = await getVerificationTask(chainId, contractAddress);
    if (!task) {
      throw new Error(`Task ${contractAddress} on chain ${chainId} not found`);
    }

    const updated: VerificationTask = {
      ...task,
      status: updates.status,
    };

    await redis.set(`task:${chainId}:${contractAddress}`, JSON.stringify(updated));
    console.log(`⚠️ updated: task:${chainId}:${contractAddress} status to: ${updates.status}`);
    return updated;
  } catch (error) {
    console.error('❌ error updating: task:${chainId}:${contractAddress}', error);
    throw error;
  }
}

/**
 * Consume a task from the queue (for worker)
 * Blocks until a task is available
 */
export async function consumeTask(timeoutSeconds: number = 0): Promise<VerificationTask | null> {
  try {
    await ensureConnected();
    // BRPOP blocks until an item is available (timeout 0 = wait forever)
    // node-redis v5 brPop takes (keys: string[], timeout: number)
    // Returns { key: string, element: string } | null
    const result = await redis.brPop([QUEUE_NAME], timeoutSeconds);

    if (!result) {
      return null;
    }

    const [chainId, contractAddress] = result.element.split(':');
    const task = await getVerificationTask(Number(chainId), contractAddress as Address);

    if (!task) {
      console.warn(`❌ task not found: task:${chainId}:${contractAddress}`);
      return null;
    }

    return task;
  } catch (error) {
    console.error('Error consuming task:', error);
    throw error;
  }
}
