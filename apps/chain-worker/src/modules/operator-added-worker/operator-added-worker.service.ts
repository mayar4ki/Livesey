import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';

import { operatorAddedQueueName, type OperatorAddedJob } from '@acme/queue';
import { PrismaService } from '../../lib/prisma/prisma.service.js';
import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import type { Env } from '../../schemas/env-validation-schema.js';
import type { OperatorAddedEventsLog } from './types.js';

@Injectable()
export class OperatorAddedWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OperatorAddedWorkerService.name);
  private worker?: Worker<OperatorAddedJob>;

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly prismaService: PrismaService,
    private readonly watermarkService: WatermarkService,
  ) {}

  async onModuleInit() {
    this.worker = new Worker<OperatorAddedJob>(
      operatorAddedQueueName,
      async (job) => this.process(job.data.log, job.data.mode),
      {
        connection: { url: this.configService.get<string>('REDIS_URL') },
        concurrency: 3,
      },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(
        `OperatorAdded job failed tx=${job?.data?.log?.transactionHash ?? 'unknown'}`,
        err instanceof Error ? err.stack : String(err),
      );
    });

    this.worker.on('completed', (job) => {
      this.logger.log(`OperatorAdded job completed id=${job.id}`);
    });

    this.logger.log('OperatorAdded worker started');
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.worker = undefined;
      this.logger.log('OperatorAdded worker stopped');
    }
  }

  /**
   * Process OperatorAdded events (idempotent via DB constraints)
   */
  async process(log: OperatorAddedEventsLog, mode: 'live' | 'backfill' = 'live') {
    const operatorAddress = log?.args?.newOperator;

    console.log(
      `📢 OperatorAdded event detected (${mode}):\n` +
        `  Operator Address: ${operatorAddress}\n` +
        `  Transaction: ${log?.transactionHash}\n` +
        `  Block: ${log?.blockNumber}`,
    );

    if (!operatorAddress) {
      this.logger.error('OperatorAdded event missing operator address');
      return;
    }

    const chainId = this.configService.get('CHAIN_ID', { infer: true }) ?? 11155111;

    try {
      await this.prismaService.client.operator.create({
        data: {
          address: operatorAddress,
          chainId: chainId,
          name: '',
        },
      });

      console.log(`✅ Operator ${operatorAddress} stored in database for chain ${chainId}`);

      const logIndex = log.logIndex !== null && log.logIndex !== undefined ? Number(log.logIndex) : undefined;
      if (log.blockNumber !== null && log.blockNumber !== undefined) {
        await this.watermarkService.setIfNewer(
          {
            chainId,
            address: log.address,
            eventName: 'OperatorAdded',
          },
          {
            block: BigInt(log.blockNumber?.toString() ?? '0'),
            logIndex,
            txHash: log.transactionHash,
          },
        );
      }
    } catch (error) {
      console.error(`❌ Error storing operator in database:`, error instanceof Error ? error.message : error);
      throw error;
    }
  }
}
