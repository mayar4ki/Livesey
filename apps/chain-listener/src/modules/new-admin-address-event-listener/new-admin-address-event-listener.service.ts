import { StoreKeys } from '@acme/cache';
import { FactoryAbi } from '@acme/smart-contract';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address, WatchContractEventOnLogsParameter } from 'viem';
import { RedisService } from '../../lib/redis/redis.service.js';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import { Env } from '../../schemas/env-validation-schema.js';

type Unwatch = () => void;

type NewAdminAddressEventsLog = WatchContractEventOnLogsParameter<typeof FactoryAbi, 'NewAdminAddress'>[number];

@Injectable()
export class NewAdminAddressEventListenerService implements OnModuleInit, OnModuleDestroy {
  private unwatch?: Unwatch;
  private readonly logger = new Logger(NewAdminAddressEventListenerService.name);

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly viemPublicClient: ViemPublicClientService,
    private readonly redisService: RedisService,
  ) {}

  onModuleInit() {
    this.logger.log('Starting NewAdminAddress listener');

    const factoryAddress = this.configService.get<string>('FACTORY_ADDRESS', {
      infer: true,
    });

    this.unwatch = this.viemPublicClient.client.watchContractEvent({
      address: factoryAddress as Address,
      abi: FactoryAbi,
      eventName: 'NewAdminAddress',
      onError: (error) => {
        this.logger.error('NewAdminAddress watcher error', error instanceof Error ? error.stack : String(error));
      },
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            await this.handle(log);
          } catch (error) {
            this.logger.error(
              'NewAdminAddress handler failed',
              error instanceof Error ? error.stack : String(error),
            );
          }
        }
      },
    });

    this.logger.log('NewAdminAddress listener ready');
  }

  /**
   * Handle NewAdminAddress events
   * Updates the cached admin address in Redis when the admin address changes
   */
  private async handle(log: NewAdminAddressEventsLog) {
    const newAdminAddress = log?.args?.admin;

    console.log(
      `📢 NewAdminAddress event detected:\n` +
        `  New Admin Address: ${newAdminAddress}\n` +
        `  Transaction: ${log?.transactionHash}\n` +
        `  Block: ${log?.blockNumber}`,
    );

    try {
      // Delete the cached admin address in Redis
      if (newAdminAddress) {
        await this.redisService.ensureConnected();
        await this.redisService.client.del(StoreKeys.FACTORY_ADMIN_ADDRESS);
      } else {
        throw Error('admin address not found');
      }
    } catch (error) {
      // Don't throw - continue listening to other events
      console.error(
        `❌ Error deleting admin address cache in Redis:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  onModuleDestroy() {
    this.unwatch?.();
    this.unwatch = undefined;
  }
}
