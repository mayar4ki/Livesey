import { LimitOrderStatus } from '@acme/db';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';

import { orderFilledQueueName, type OrderFilledJob } from '@acme/queue';
import { PrismaService } from '../../lib/prisma/prisma.service.js';
import type { Env } from '../../schemas/env-validation-schema.js';
import type { OrderFilledEventsLog } from './types.js';

@Injectable()
export class OrderFilledWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrderFilledWorkerService.name);
  private worker?: Worker<OrderFilledJob>;

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly prismaService: PrismaService,
  ) {}

  async onModuleInit() {
    this.worker = new Worker<OrderFilledJob>(
      orderFilledQueueName,
      async (job) => this.process(job.data.log, job.data.mode),
      {
        connection: { url: process.env.REDIS_URL },
        concurrency: 3,
      },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(
        `OrderFilled job failed tx=${job?.data?.log?.transactionHash ?? 'unknown'}`,
        err instanceof Error ? err.stack : String(err),
      );
    });

    this.worker.on('completed', (job) => {
      this.logger.log(`OrderFilled job completed id=${job.id}`);
    });

    this.logger.log('OrderFilled worker started');
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.worker = undefined;
      this.logger.log('OrderFilled worker stopped');
    }
  }

  /**
   * Handle OrderFilled events
   */
  private async process(log: OrderFilledEventsLog, mode: 'live' | 'backfill' = 'live') {
    const orderHash = log?.args?.orderHash;
    const remainingMakingAmount = log.args.remainingAmount?.toString();
    const chainId = this.configService.get<string>('CHAIN_ID', {
      infer: true,
    });
    console.log(
      `📢 OrderFilled event detected (${mode}):\n` +
        `  Order Hash: ${orderHash}\n` +
        `  Transaction: ${log?.transactionHash}\n` +
        `  Block: ${log?.blockNumber}`,
    );

    try {
      await this.prismaService.client.limitOrder.update({
        where: {
          orderHash_chainId: {
            orderHash: orderHash as string,
            chainId: Number(chainId),
          },
        },
        data: {
          remainingMakingAmount: remainingMakingAmount,
          ...(remainingMakingAmount &&
            BigInt(remainingMakingAmount) === BigInt(0) && {
              status: LimitOrderStatus.filled,
            }),
        },
      });

      console.log(`✅ Limit Order operator updated in database: ${orderHash}`);
    } catch (error) {
      console.error(`❌ Error updating token operator in database:`, error);
      throw error;
    }
  }
}
