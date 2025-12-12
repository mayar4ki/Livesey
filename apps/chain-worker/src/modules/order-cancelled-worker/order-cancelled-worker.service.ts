import { LimitOrderStatus } from '@acme/db';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';

import { orderCancelledQueueName, type OrderCancelledJob } from '@acme/queue';
import { PrismaService } from '../../lib/prisma/prisma.service.js';
import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import type { Env } from '../../schemas/env-validation-schema.js';
import type { OrderCancelledEventsLog } from './types.js';

@Injectable()
export class OrderCancelledWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrderCancelledWorkerService.name);
  private worker?: Worker<OrderCancelledJob>;

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly prismaService: PrismaService,
    private readonly watermarkService: WatermarkService,
  ) {}

  async onModuleInit() {
    this.worker = new Worker<OrderCancelledJob>(
      orderCancelledQueueName,
      async (job) => this.process(job.data.log, job.data.mode),
      {
        connection: { url: this.configService.get<string>('REDIS_URL') },
        concurrency: 3,
      },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(
        `OrderCancelled job failed tx=${job?.data?.log?.transactionHash ?? 'unknown'}`,
        err instanceof Error ? err.stack : String(err),
      );
    });

    this.worker.on('completed', (job) => {
      this.logger.log(`OrderCancelled job completed id=${job.id}`);
    });

    this.logger.log('OrderCancelled worker started');
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.worker = undefined;
      this.logger.log('OrderCancelled worker stopped');
    }
  }

  /**
   * Handle OrderCancelled events
   */
  private async process(log: OrderCancelledEventsLog, mode: 'live' | 'backfill' = 'live') {
    const orderHash = log?.args?.orderHash;
    const chainId = this.configService.get<string>('CHAIN_ID', {
      infer: true,
    });
    console.log(
      `📢 OrderCancelled event detected (${mode}):\n` +
        `  Order Hash: ${orderHash}\n` +
        `  Transaction: ${log?.transactionHash}\n` +
        `  Block: ${log?.blockNumber}`,
    );

    try {
      if (!orderHash) {
        throw Error('orderHash not defined');
      }
      await this.prismaService.client.limitOrder.update({
        where: {
          orderHash_chainId: {
            orderHash: orderHash,
            chainId: Number(chainId),
          },
        },
        data: {
          status: LimitOrderStatus.cancelled,
        },
      });

      console.log(`✅ Limit Order operator updated in database: ${orderHash}`);

      const logIndex = log.logIndex !== null && log.logIndex !== undefined ? Number(log.logIndex) : undefined;
      if (log.blockNumber !== null && log.blockNumber !== undefined) {
        await this.watermarkService.setIfNewer(
          {
            chainId: chainId!,
            address: log.address,
            eventName: 'OrderCancelled',
          },
          {
            block: log.blockNumber,
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
