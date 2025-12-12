import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Worker } from 'bullmq';
import { Address } from 'viem';

import { verificationQueueName, type VerificationTaskJob } from '@acme/queue';
import { verifyContractSourcify } from '@acme/smart-contract/utils/sourcify-verification';
import { PrismaService } from '../lib/prisma/prisma.service.js';

@Injectable()
export class VerificationWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(VerificationWorkerService.name);
  private worker?: Worker<VerificationTaskJob>;

  constructor(private readonly prismaService: PrismaService) {}

  async onModuleInit() {
    this.worker = new Worker<VerificationTaskJob>(
      verificationQueueName,
      async (job) => this.process(job.data),
      {
        connection: { url: process.env.REDIS_URL },
        concurrency: 3,
      },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(
        `Verification job failed token=${job?.data?.token?.token ?? 'unknown'}`,
        err instanceof Error ? err.stack : String(err),
      );
    });

    this.worker.on('completed', (job) => {
      this.logger.log(`Verification job completed id=${job.id}`);
    });

    this.logger.log('Verification worker started');
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.worker = undefined;
      this.logger.log('Verification worker stopped');
    }
  }

  private async process(job: VerificationTaskJob) {
    const token = job.token.token as Address;
    const chainId = job.chainId;

    console.log(`✅ processing: task:${chainId}:${token}`);

    try {
      await this.verifyProxy(token, chainId.toString());
      await this.storeVerifiedContract(token, chainId);
      console.log(`✅ successfully verified: task:${chainId}:${token}`);
    } catch (error) {
      console.error(`✗ Failed to verify contract ${token} on chain ${chainId}:`, error);
      throw error;
    }
  }

  private async verifyProxy(beaconProxyAddress: string, chainId: string) {
    console.log(`📝 BeaconProxy address: ${beaconProxyAddress}`);
    console.log(`🌐 Chain ID: ${chainId}`);

    console.log('📋 Found deployment, verifying contracts...\n');

    console.log('🔍 Verifying BeaconProxy...');
    await verifyContractSourcify({
      contractAddress: beaconProxyAddress,
      chainId: Number(chainId),
      contractName: 'BeaconProxy',
      sourceName: 'contracts/BeaconProxy/BeaconProxy.sol',
    });
  }

  private async storeVerifiedContract(token: Address, chainId: number): Promise<void> {
    const updated = await this.prismaService.client.token.updateMany({
      where: {
        token: token,
        chainId: chainId,
      },
      data: {
        verifiedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      console.warn(
        `⚠️ Token not found in database: ${token} on chain ${chainId}. It may not have been deployed through the factory.`,
      );
    } else {
      console.log(`✅ Token marked as verified in PostgreSQL: ${token}`);
    }
  }
}
