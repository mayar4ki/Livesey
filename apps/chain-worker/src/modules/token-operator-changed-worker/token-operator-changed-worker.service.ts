import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';

import { tokenNewOperatorAddressQueueName, type TokenNewOperatorAddressJob } from '@acme/queue';
import { PrismaService } from '../../lib/prisma/prisma.service.js';
import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import type { Env } from '../../schemas/env-validation-schema.js';
import type { TokenNewOperatorAddressEventsLog } from './types.js';

@Injectable()
export class TokenOperatorChangedWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TokenOperatorChangedWorkerService.name);
  private worker?: Worker<TokenNewOperatorAddressJob>;

  constructor(
    private readonly viemConfig: ConfigService<Env>,
    private readonly prismaService: PrismaService,
    private readonly watermarkService: WatermarkService,
  ) {}

  async onModuleInit() {
    this.worker = new Worker<TokenNewOperatorAddressJob>(
      tokenNewOperatorAddressQueueName,
      async (job) => this.process(job.data.log, job.data.mode),
      {
        connection: { url: this.viemConfig.get<string>('REDIS_URL') },
        concurrency: 3,
      },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(
        `TokenNewOperatorAddress job failed tx=${job?.data?.log?.transactionHash ?? 'unknown'}`,
        err instanceof Error ? err.stack : String(err),
      );
    });

    this.worker.on('completed', (job) => {
      this.logger.log(`TokenNewOperatorAddress job completed id=${job.id}`);
    });

    this.logger.log('TokenNewOperatorAddress worker started');
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.worker = undefined;
      this.logger.log('TokenNewOperatorAddress worker stopped');
    }
  }

  /**
   * Handle TokenNewOperatorAddress events
   * Updates the cached operator address in Redis when the operator address changes
   */
  private async process(log: TokenNewOperatorAddressEventsLog, mode: 'live' | 'backfill' = 'live') {
    const chainId = this.viemConfig.get('CHAIN_ID', { infer: true }) ?? 11155111;

    const newOperatorAddress = log?.args?.operator;
    const tokenAddress = log?.args?.token;

    console.log(
      `📢 TokenNewOperatorAddress event detected (${mode}):\n` +
        `  New Operator Address: ${newOperatorAddress}\n` +
        `  Token Address: ${tokenAddress}\n` +
        `  Transaction: ${log?.transactionHash}\n` +
        `  Block: ${log?.blockNumber}`,
    );

    try {
      const operator = await this.prismaService.client.operator.upsert({
        where: {
          address_chainId: {
            address: newOperatorAddress as string,
            chainId,
          },
        },
        update: {},
        create: {
          address: newOperatorAddress as string,
          chainId,
          name: '',
        },
      });

      await this.prismaService.client.token.update({
        where: {
          token_chainId: {
            token: tokenAddress as string,
            chainId,
          },
        },
        data: {
          operatorId: operator.id,
        },
      });

      console.log(`✅ Token operator updated in database: ${tokenAddress}`);

      const logIndex = log.logIndex !== null && log.logIndex !== undefined ? Number(log.logIndex) : undefined;
      if (log.blockNumber !== null && log.blockNumber !== undefined) {
        await this.watermarkService.setIfNewer(
          {
            chainId,
            address: log.address,
            eventName: 'TokenNewOperatorAddress',
          },
          {
            block: BigInt(log.blockNumber?.toString() ?? '0'),
            logIndex,
            txHash: log.transactionHash,
          },
        );
      }
    } catch (error) {
      console.error(`❌ Error updating token operator in database:`, error);
      throw error;
    }
  }
}
