import { redis, ensureConnected } from './client';

const QUEUE_NAME = 'queue:verification';


/**
 * Create a new verification task and add to queue
 */
export async function createVerificationTask(data: {
    contractAddress: string;
    chainId: number;
}) {
    try {
        await ensureConnected();

        const contractAddress = data.contractAddress;

        const task = {
            contractAddress: data.contractAddress,
            chainId: data.chainId,
            status: 'pending' as const
        };

        // Store task in Redis with key: task:{contractAddress}
        await redis.set(`task:${contractAddress}`, JSON.stringify(task));

        // Add contract address to queue (using Redis List)
        await redis.lPush(QUEUE_NAME, contractAddress);

        console.log(`Created verification task for contract: ${data.contractAddress}`);
        return task;
    } catch (error) {
        console.error('Error creating verification task:', error);
        throw error;
    }
}

/**
 * Get verification task by contract address
 */
export async function getVerificationTask(contractAddress: string) {
    try {
        await ensureConnected();
        const data = await redis.get(`task:${contractAddress}`);
        if (!data) {
            return null;
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Error getting verification task:', error);
        return null;
    }
}