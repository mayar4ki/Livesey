import { FactoryAbi } from '@acme/smart-contract';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address, WatchContractEventOnLogsParameter } from 'viem';

import { PrismaService } from '../../lib/prisma/prisma.service.js';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import type { Env } from '../../schemas/env-validation-schema.js';

type EventsLog = WatchContractEventOnLogsParameter<typeof FactoryAbi, 'TokenNewOperatorAddress'>[number];

type Unwatch = () => void;

@Injectable()
export class TokenOperatorChangedEventListenerService implements OnModuleInit, OnModuleDestroy {
  private unwatch?: Unwatch;
  private readonly logger = new Logger(TokenOperatorChangedEventListenerService.name);

  constructor(
    private readonly viemPublicClient: ViemPublicClientService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService<Env>,
  ) {}

  onModuleInit() {
    this.logger.log('Starting TokenNewOperatorAddress listener');

    const factoryAddress = this.configService.get<string>('FACTORY_ADDRESS', {
      infer: true,
    });

    this.unwatch = this.viemPublicClient.client.watchContractEvent({
      address: factoryAddress as Address,
      abi: FactoryAbi,
      eventName: 'TokenNewOperatorAddress',
      onError: (error) => {
        this.logger.error(
          'TokenNewOperatorAddress watcher error',
          error instanceof Error ? error.stack : String(error),
        );
      },
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            await this.handle(log);
          } catch (error) {
            this.logger.error(
              'TokenNewOperatorAddress handler failed',
              error instanceof Error ? error.stack : String(error),
            );
          }
        }
      },
    });

    this.logger.log('TokenNewOperatorAddress listener ready');
  }

  /**
   * Handle TokenNewOperatorAddress events
   * Updates the cached operator address in Redis when the operator address changes
   */
  private async handle(log: EventsLog) {
    const chainId = this.configService.get('CHAIN_ID', { infer: true }) ?? 11155111;

    const newOperatorAddress = log?.args?.operator;
    const tokenAddress = log?.args?.token;

    console.log(
      `📢 TokenNewOperatorAddress event detected:\n` +
        `  New Operator Address: ${newOperatorAddress}\n` +
        `  Token Address: ${tokenAddress}\n` +
        `  Transaction: ${log?.transactionHash}\n` +
        `  Block: ${log?.blockNumber}`,
    );

    try {
      // Find the operator by address and chainId to get the operatorId
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
    } catch (error) {
      console.error(`❌ Error updating token operator in database:`, error);
    }
  }

  onModuleDestroy() {
    this.unwatch?.();
    this.unwatch = undefined;
  }
}
