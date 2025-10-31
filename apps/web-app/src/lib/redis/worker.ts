import { getVerificationTask } from '.';
import { redis, ensureConnected } from './client';


const QUEUE_NAME = 'queue:verification';

/**
 * Update verification task status
 */
export async function updateVerificationTask(
    contractAddress: string,
    updates: {
        status: 'pending' | 'processing' | 'completed' | 'failed';
        errorMessage?: string;
    }
) {
    try {
        await ensureConnected();
        const task = await getVerificationTask(contractAddress);
        if (!task) {
            throw new Error(`Task ${contractAddress} not found`);
        }

        const updated = {
            ...task,
            status: updates.status,
            errorMessage: updates.errorMessage || null,
            updatedAt: new Date().toISOString(),
            completedAt:
                updates.status === 'completed' || updates.status === 'failed'
                    ? new Date().toISOString()
                    : task.completedAt,
        };

        await redis.set(`task:${contractAddress}`, JSON.stringify(updated));
        console.log(`Updated task ${contractAddress} status to: ${updates.status}`);
        return updated;
    } catch (error) {
        console.error('Error updating verification task:', error);
        throw error;
    }
}

/**
 * Consume a task from the queue (for worker)
 * Blocks until a task is available
 */
export async function consumeTask(timeoutSeconds: number = 0): Promise<{
    contractAddress: string;
    task: any;
} | null> {
    try {
        await ensureConnected();
        // BRPOP blocks until an item is available (timeout 0 = wait forever)
        // node-redis v5 brPop takes (keys: string[], timeout: number)
        // Returns { key: string, element: string } | null
        const result = await redis.brPop([QUEUE_NAME], timeoutSeconds);

        if (!result) {
            return null;
        }

        const contractAddress = result.element;
        const task = await getVerificationTask(contractAddress);

        if (!task) {
            console.warn(`Task ${contractAddress} not found in Redis`);
            return null;
        }

        return { contractAddress, task };
    } catch (error) {
        console.error('Error consuming task:', error);
        throw error;
    }
}

