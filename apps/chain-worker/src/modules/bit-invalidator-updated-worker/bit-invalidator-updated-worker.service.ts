import { LimitOrderStatus } from '@acme/db';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';

import { bitInvalidatorUpdatedQueueName, type BitInvalidatorUpdatedJob } from '@acme/queue';
import { PrismaService } from '../../lib/prisma/prisma.service.js';
import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import type { Env } from '../../schemas/env-validation-schema.js';
import type { BitInvalidatorUpdatedEventsLog } from './types.js';

@Injectable()
export class BitInvalidatorUpdatedWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BitInvalidatorUpdatedWorkerService.name);
  private worker?: Worker<BitInvalidatorUpdatedJob>;

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly prismaService: PrismaService,
    private readonly watermarkService: WatermarkService,
  ) {}

  async onModuleInit() {
    this.worker = new Worker<BitInvalidatorUpdatedJob>(
      bitInvalidatorUpdatedQueueName,
      async (job) => this.process(job.data.log, job.data.mode),
      {
        connection: { url: this.configService.get<string>('REDIS_URL') },
        concurrency: 3,
      },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(
        `BitInvalidatorUpdated job failed tx=${job?.data?.log?.transactionHash ?? 'unknown'}`,
        err instanceof Error ? err.stack : String(err),
      );
    });

    this.worker.on('completed', (job) => {
      this.logger.log(`BitInvalidatorUpdated job completed id=${job.id}`);
    });

    this.logger.log('BitInvalidatorUpdated worker started');
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.worker = undefined;
      this.logger.log('BitInvalidatorUpdated worker stopped');
    }
  }

  /**
   * Handle BitInvalidatorUpdated events
   */
  private async process(log: BitInvalidatorUpdatedEventsLog, mode: 'live' | 'backfill' = 'live') {
    const maker = log?.args?.maker;
    const slotIndex = log?.args?.slotIndex;
    const slotValue = log?.args?.slotValue; // This is the bitmap!

    /**
     * ************1inch Limit Order Protocol************ BitInvalidatorLib.sol
     * when u cancel an order, what they do is to make the nonce invalid ❌ so it can't be filled
     * they have a map (makeAddress -> _data)
     *
     * focus on the _data 🍎
     * they take the nonce shift it by 8 bits (same as if u divide by 256)
     * then they use the result as a key 🔑 for _data they call it slotIndex 🎯
     * _data is actually a map (slotIndex -> bitmap(slotValue))
     *
     * when we do shifting multiple nonces might have same result (slotIndex) 🥸
     * to know which nonce is cancelled we can use the slotValue
     *  which is a bitmap that has a bit for each nonce, if the bit is set then the nonce is cancelled 💀
     *
     */
    if (!maker || slotIndex === undefined || slotValue === undefined) {
      this.logger.warn('Missing required event args');
      return;
    }

    const chainId = this.configService.get<string>('CHAIN_ID', { infer: true });

    console.log(
      `📢 BitInvalidatorUpdated event detected (${mode}):\n` +
        `  Maker: ${maker}\n` +
        `  SlotIndex: ${slotIndex}\n` +
        `  SlotValue (bitmap): ${slotValue}\n` +
        `  Transaction: ${log?.transactionHash}\n` +
        `  Block: ${log?.blockNumber}`,
    );

    try {
      // Calculate the nonce range for this slot
      const slotStart = BigInt(slotIndex) << 8n; // slotIndex * 256

      // Find all orders in this slot range for this maker
      const ordersInSlot = await this.prismaService.client.limitOrder.findMany({
        where: {
          maker: maker,
          chainId: Number(chainId),
          nonce: {
            gte: slotStart, // grater than slotStart
            lt: slotStart + 256n, // less than slotStart+256
          },
          status: LimitOrderStatus.pending, // Only update pending orders
        },
        select: { id: true, nonce: true },
      });

      // Filter orders that are cancelled (bit is set in the bitmap)
      const cancelledOrderIds = ordersInSlot
        .filter((order) => {
          const bitPosition = order.nonce % 256n;
          return (BigInt(slotValue) >> bitPosition) & 1n; // Check if bit is set
        })
        .map((order) => order.id);

      if (cancelledOrderIds.length > 0) {
        const result = await this.prismaService.client.limitOrder.updateMany({
          where: { id: { in: cancelledOrderIds } },
          data: { status: LimitOrderStatus.cancelled },
        });

        console.log(`✅ Cancelled ${result.count} orders`);
      } else {
        console.log(`ℹ️ No matching orders found to cancel`);
      }

      const logIndex = log.logIndex !== null && log.logIndex !== undefined ? Number(log.logIndex) : undefined;
      if (log.blockNumber !== null && log.blockNumber !== undefined) {
        await this.watermarkService.setIfNewer(
          {
            chainId: chainId!,
            address: log.address,
            eventName: 'BitInvalidatorUpdated',
          },
          {
            block: log.blockNumber,
            logIndex,
            txHash: log.transactionHash,
          },
        );
      }
    } catch (error) {
      console.error(`❌ Error updating cancelled orders:`, error);
      throw error;
    }
  }
}
