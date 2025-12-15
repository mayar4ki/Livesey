import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';

import { getOperatorStoreKey } from '@acme/cache';
import { OperatorPausedJob, operatorPausedQueueName } from '@acme/queue';
import { PrismaService } from '../../lib/prisma/prisma.service.js';
import { RedisService } from '../../lib/redis/redis.service.js';
import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import type { Env } from '../../schemas/env-validation-schema.js';
import type { OperatorPausedEventsLog } from './types.js';

@Injectable()
export class OperatorPausedWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OperatorPausedWorkerService.name);
  private worker?: Worker<OperatorPausedJob>;

  constructor(
    private readonly viemConfig: ConfigService<Env>,
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
    private readonly watermarkService: WatermarkService,
  ) {}

  async onModuleInit() {
    this.worker = new Worker<OperatorPausedJob>(
      operatorPausedQueueName,
      async (job) => this.process(job.data.log, job.data.mode),
      {
        connection: { url: this.viemConfig.get<string>('REDIS_URL') },
        concurrency: 3,
      },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(
        `OperatorPaused job failed tx=${job?.data?.log?.transactionHash ?? 'unknown'}`,
        err instanceof Error ? err.stack : String(err),
      );
    });

    this.worker.on('completed', (job) => {
      this.logger.log(`OperatorPaused job completed id=${job.id}`);
    });

    this.logger.log('OperatorPaused worker started');
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.worker = undefined;
      this.logger.log('OperatorPaused worker stopped');
    }
  }

  private async process(log: OperatorPausedEventsLog, mode: 'live' | 'backfill' = 'live') {
    const operatorAddress = log.args.operator;
    console.log(
      `📢 OperatorPaused event detected (${mode}):\n` +
        `  Operator Address: ${operatorAddress}\n` +
        `  Transaction: ${log?.transactionHash}\n` +
        `  Block: ${log?.blockNumber}`,
    );

    if (!operatorAddress) {
      this.logger.error('OperatorPaused event missing operator address');
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
          isPaused: true,
        },
        create: {
          address: operatorAddress,
          chainId: chainId,
          name: '',
          isPaused: true,
        },
      });

      console.log(`✅ Operator ${operatorAddress} marked as paused in database`);

      await this.redisService.ensureConnected();
      await this.redisService.client.del(getOperatorStoreKey(operatorAddress));

      const logIndex = log.logIndex !== null && log.logIndex !== undefined ? Number(log.logIndex) : undefined;
      if (log.blockNumber !== null && log.blockNumber !== undefined) {
        await this.watermarkService.setIfNewer(
          {
            chainId,
            address: log.address,
            eventName: 'OperatorPaused',
          },
          {
            block: BigInt(log.blockNumber?.toString() ?? '0'),
            logIndex,
            txHash: log.transactionHash,
          },
        );
      }
    } catch (error) {
      console.error(`❌ Error updating operator paused status:`, error instanceof Error ? error.message : error);
      throw error;
    }
  }
}
