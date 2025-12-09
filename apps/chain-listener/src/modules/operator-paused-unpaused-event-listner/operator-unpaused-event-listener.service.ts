import { FactoryAbi } from '@acme/smart-contract';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address, WatchContractEventOnLogsParameter } from 'viem';

import { getOperatorStoreKey } from 'node_modules/@acme/queue/src/keys.js';
import { RedisService } from 'src/lib/redis/redis.service.js';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import type { Env } from '../../schemas/env-validation-schema.js';

type EventsLog = WatchContractEventOnLogsParameter<typeof FactoryAbi, 'OperatorUnpaused'>[number];

type Unwatch = () => void;

@Injectable()
export class OperatorUnpausedEventListenerService implements OnModuleInit, OnModuleDestroy {
  private unwatch?: Unwatch;
  private readonly logger = new Logger(OperatorUnpausedEventListenerService.name);

  constructor(
    private readonly viemPublicClient: ViemPublicClientService,
    private readonly configService: ConfigService<Env>,
    private readonly redisService: RedisService,
  ) {}

  onModuleInit() {
    this.logger.log('Starting OperatorUnpaused listener');

    const factoryAddress = this.configService.get<string>('FACTORY_ADDRESS', {
      infer: true,
    });

    this.unwatch = this.viemPublicClient.client.watchContractEvent({
      address: factoryAddress as Address,
      abi: FactoryAbi,
      eventName: 'OperatorUnpaused',
      onError: (error) => {
        this.logger.error('OperatorUnpaused watcher error', error instanceof Error ? error.stack : String(error));
      },
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            await this.handle(log);
          } catch (error) {
            this.logger.error(
              'OperatorUnpaused handler failed',
              error instanceof Error ? error.stack : String(error),
            );
          }
        }
      },
    });

    this.logger.log('OperatorUnpaused listener ready');
  }

  /**
   * Handle OperatorUnpaused events
   * Updates the cached operator address in Redis when the operator address changes
   */
  private async handle(log: EventsLog) {
    const operatorAddress = log.args.operator;
    console.log(
      `📢 OperatorUnpaused event detected:\n` +
        `  Operator Address: ${operatorAddress}\n` +
        `  Transaction: ${log?.transactionHash}\n` +
        `  Block: ${log?.blockNumber}`,
    );

    try {
      // Delete the cached operator address in Redis
      if (operatorAddress) {
        await this.redisService.ensureConnected();
        await this.redisService.client.del(getOperatorStoreKey(operatorAddress));
      } else {
        throw Error('operator address not found');
      }
    } catch (error) {
      // Don't throw - continue listening to other events
      console.error(
        `❌ Error deleting operator address cache in Redis:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  onModuleDestroy() {
    this.unwatch?.();
    this.unwatch = undefined;
  }
}
