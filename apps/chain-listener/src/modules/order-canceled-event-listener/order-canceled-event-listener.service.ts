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
  'OrderCancelled'
>[number];

@Injectable()
export class OrderCanceledEventListenerService implements OnModuleInit, OnModuleDestroy {
  private unwatch?: Unwatch;
  private readonly logger = new Logger(OrderCanceledEventListenerService.name);

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly viemPublicClient: ViemPublicClientService,
    private readonly prismaService: PrismaService,
  ) {}

  onModuleInit() {
    this.logger.log('Starting OrderCancelled listener');

    const chainId = this.configService.get<string>('CHAIN_ID', {
      infer: true,
    });

    const lopAddress: Address = oneInchLimitOrderProtocolAddresses[chainId!];

    this.unwatch = this.viemPublicClient.client.watchContractEvent({
      address: lopAddress,
      abi: ONEINCH_LIMIT_ORDER_PROTOCOL_ABI,
      eventName: 'OrderCancelled',
      onError: (error) => {
        this.logger.error('OrderCancelled watcher error', error instanceof Error ? error.stack : String(error));
      },
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            await this.handle(log);
          } catch (error) {
            this.logger.error(
              'OrderCancelled handler failed',
              error instanceof Error ? error.stack : String(error),
            );
          }
        }
      },
    });

    this.logger.log('OrderCancelled listener ready');
  }

  /**
   * Handle OrderCancelled events
   */
  private async handle(log: EventsLog) {
    const orderHash = log?.args?.orderHash;
    const chainId = this.configService.get<string>('CHAIN_ID', {
      infer: true,
    });
    console.log(
      `📢 OrderCancelled event detected:\n` +
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
    } catch (error) {
      console.error(`❌ Error updating token operator in database:`, error);
    }
  }

  onModuleDestroy() {
    this.unwatch?.();
    this.unwatch = undefined;
  }
}
