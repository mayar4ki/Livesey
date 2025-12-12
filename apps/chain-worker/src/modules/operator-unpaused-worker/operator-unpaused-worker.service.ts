import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';

import { getOperatorStoreKey, operatorUnpausedQueueName, type OperatorUnpausedJob } from '@acme/queue';
import { PrismaService } from '../../lib/prisma/prisma.service.js';
import { RedisService } from '../../lib/redis/redis.service.js';
import type { Env } from '../../schemas/env-validation-schema.js';
import type { OperatorUnpausedEventsLog } from './types.js';

@Injectable()
export class OperatorUnpausedWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OperatorUnpausedWorkerService.name);
  private worker?: Worker<OperatorUnpausedJob>;

  constructor(
    private readonly viemConfig: ConfigService<Env>,
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
  ) {}

  async onModuleInit() {
    this.worker = new Worker<OperatorUnpausedJob>(
      operatorUnpausedQueueName,
      async (job) => this.process(job.data.log, job.data.mode),
      {
        connection: { url: process.env.REDIS_URL },
        concurrency: 3,
      },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(
        `OperatorUnpaused job failed tx=${job?.data?.log?.transactionHash ?? 'unknown'}`,
        err instanceof Error ? err.stack : String(err),
      );
    });

    this.worker.on('completed', (job) => {
      this.logger.log(`OperatorUnpaused job completed id=${job.id}`);
    });

    this.logger.log('OperatorUnpaused worker started');
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.worker = undefined;
      this.logger.log('OperatorUnpaused worker stopped');
    }
  }

  private async process(log: OperatorUnpausedEventsLog, mode: 'live' | 'backfill' = 'live') {
    const operatorAddress = log.args.operator;
    console.log(
      `📢 OperatorUnpaused event detected (${mode}):\n` +
        `  Operator Address: ${operatorAddress}\n` +
        `  Transaction: ${log?.transactionHash}\n` +
        `  Block: ${log?.blockNumber}`,
    );

    if (!operatorAddress) {
      this.logger.error('OperatorUnpaused event missing operator address');
      return;
    }

    const chainId = this.viemConfig.get('CHAIN_ID', { infer: true }) ?? 11155111;

    try {
      await this.prismaService.client.operator.upsert({
        where: {
          address_chainId: {
            address: operatorAddress,
            chainId: chainId,
          },
        },
        update: {
          isPaused: false,
        },
        create: {
          address: operatorAddress,
          chainId: chainId,
          name: '',
          isPaused: false,
        },
      });

      console.log(`✅ Operator ${operatorAddress} marked as unpaused in database`);

      await this.redisService.ensureConnected();
      await this.redisService.client.del(getOperatorStoreKey(operatorAddress));
    } catch (error) {
      console.error(`❌ Error updating operator unpaused status:`, error instanceof Error ? error.message : error);
      throw error;
    }
  }
}
