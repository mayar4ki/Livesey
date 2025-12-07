import { LimitOrderStatus } from '@acme/db';
import { ONEINCH_LIMIT_ORDER_PROTOCOL_ABI, oneInchLimitOrderProtocolAddresses } from '@acme/shared';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address, WatchContractEventOnLogsParameter } from 'viem';
import { PrismaService } from '../../lib/prisma/prisma.service.js';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import { Env } from '../../schemas/env-validation-schema.js';

type Unwatch = () => void;

type EventsLog = WatchContractEventOnLogsParameter<
  typeof ONEINCH_LIMIT_ORDER_PROTOCOL_ABI,
  'BitInvalidatorUpdated'
>[number];

@Injectable()
export class BitInvalidatorUpdatedEventListenerService implements OnModuleInit, OnModuleDestroy {
  private unwatch?: Unwatch;
  private readonly logger = new Logger(BitInvalidatorUpdatedEventListenerService.name);

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly viemPublicClient: ViemPublicClientService,
    private readonly prismaService: PrismaService,
  ) {}

  onModuleInit() {
    this.logger.log('Starting BitInvalidatorUpdated listener');

    const chainId = this.configService.get<string>('CHAIN_ID', {
      infer: true,
    });

    const lopAddress: Address = oneInchLimitOrderProtocolAddresses[chainId!];

    this.unwatch = this.viemPublicClient.client.watchContractEvent({
      address: lopAddress,
      abi: ONEINCH_LIMIT_ORDER_PROTOCOL_ABI,
      eventName: 'BitInvalidatorUpdated',
      onError: (error) => {
        this.logger.error(
          'BitInvalidatorUpdated watcher error',
          error instanceof Error ? error.stack : String(error),
        );
      },
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            await this.handle(log);
          } catch (error) {
            this.logger.error(
              'BitInvalidatorUpdated handler failed',
              error instanceof Error ? error.stack : String(error),
            );
          }
        }
      },
    });

    this.logger.log('BitInvalidatorUpdated listener ready');
  }

  /**
   * Handle BitInvalidatorUpdated events
   */
  private async handle(log: EventsLog) {
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
      `📢 BitInvalidatorUpdated event detected:\n` +
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
    } catch (error) {
      console.error(`❌ Error updating cancelled orders:`, error);
    }
  }

  onModuleDestroy() {
    this.unwatch?.();
    this.unwatch = undefined;
  }
}
