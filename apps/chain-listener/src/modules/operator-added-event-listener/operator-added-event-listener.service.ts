import { FactoryAbi } from '@acme/smart-contract';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address, WatchContractEventOnLogsParameter } from 'viem';
import { PrismaService } from '../../lib/prisma/prisma.service.js';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import { Env } from '../../schemas/env-validation-schema.js';

type Unwatch = () => void;

type OperatorAddedEventsLog = WatchContractEventOnLogsParameter<typeof FactoryAbi, 'OperatorAdded'>[number];

@Injectable()
export class OperatorAddedEventListenerService implements OnModuleInit, OnModuleDestroy {
  private unwatch?: Unwatch;
  private readonly logger = new Logger(OperatorAddedEventListenerService.name);

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly viemPublicClient: ViemPublicClientService,
    private readonly prismaService: PrismaService,
  ) {}

  onModuleInit() {
    this.logger.log('Starting OperatorAdded listener');

    const factoryAddress = this.configService.get<string>('FACTORY_ADDRESS', {
      infer: true,
    });

    this.unwatch = this.viemPublicClient.client.watchContractEvent({
      address: factoryAddress as Address,
      abi: FactoryAbi,
      eventName: 'OperatorAdded',
      onError: (error) => {
        this.logger.error('OperatorAdded watcher error', error instanceof Error ? error.stack : String(error));
      },
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            await this.handle(log);
          } catch (error) {
            this.logger.error(
              'OperatorAdded handler failed',
              error instanceof Error ? error.stack : String(error),
            );
          }
        }
      },
    });

    this.logger.log('OperatorAdded listener ready');
  }

  /**
   * Handle OperatorAdded events
   * Creates a new Operator record in the database
   */
  private async handle(log: OperatorAddedEventsLog) {
    const operatorAddress = log?.args?.newOperator;

    console.log(
      `📢 OperatorAdded event detected:\n` +
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
      // Upsert operator to handle potential duplicates gracefully
      await this.prismaService.client.operator.create({
        data: {
          address: operatorAddress,
          chainId: chainId,
          name: '', // Name will be set later via admin app
        },
      });

      console.log(`✅ Operator ${operatorAddress} stored in database for chain ${chainId}`);
    } catch (error) {
      console.error(`❌ Error storing operator in database:`, error instanceof Error ? error.message : error);
      throw error;
    }
  }

  onModuleDestroy() {
    this.unwatch?.();
    this.unwatch = undefined;
  }
}
