import { Address } from 'viem';
import { redis, ensureConnected } from './client';
import { prisma } from '../prisma/client';

const QUEUE_NAME = 'queue:verification';

export type VerificationTask = {
  contractAddress: Address;
  chainId: number;
  walletAddress: Address;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  args: any[];
};

export type CreateVerificationTaskProps = {
  contractAddress: Address;
  chainId: number;
  walletAddress: Address;
  args: any[];
};

/**
 * Create a new verification task and add to queue
 */
export async function createVerificationTask(data: CreateVerificationTaskProps) {
  try {
    await ensureConnected();

    const { contractAddress, chainId, walletAddress, args } = data;

    const task: VerificationTask = {
      contractAddress,
      chainId,
      walletAddress,
      args,
      status: 'pending',
    };

    // Store task in Redis with key: task:{contractAddress}
    await redis.set(`task:${chainId}:${contractAddress}`, JSON.stringify(task));

    // Add tx to queue (using Redis List)
    await redis.lPush(QUEUE_NAME, `${chainId}:${contractAddress}`);

    console.log(`✅ new task: task:${chainId}:${contractAddress} for wallet: ${walletAddress}`);
    return task;
  } catch (error) {
    console.error('Error creating verification task:', error);
    throw error;
  }
}

/**
 * Get verification task by chainId and tx
 */
export async function getVerificationTask(chainId: number, contractAddress: Address): Promise<VerificationTask | null> {
  try {
    await ensureConnected();
    const data = await redis.get(`task:${chainId}:${contractAddress}`);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as VerificationTask;
  } catch (error) {
    console.error('Error getting verification task:', error);
    return null;
  }
}
