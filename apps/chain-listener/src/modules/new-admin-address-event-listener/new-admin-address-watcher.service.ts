import { FactoryAbi } from '@acme/smart-contract';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Address, WatchContractEventOnLogsParameter } from 'viem';

import { StoreKeys } from '@acme/cache';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../lib/redis/redis.service.js';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import { Env } from '../../schemas/env-validation-schema.js';

type Unwatch = () => void;
type NewAdminAddressEventsLog = WatchContractEventOnLogsParameter<typeof FactoryAbi, 'NewAdminAddress'>[number];

@Injectable()
export class NewAdminAddressWatcherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NewAdminAddressWatcherService.name);
  private unwatch?: Unwatch;

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly viemPublicClient: ViemPublicClientService,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    const factoryAddress = this.configService.get<string>('FACTORY_ADDRESS', {
      infer: true,
    });

    await this.deleteAdminAddressCache();

    this.unwatch = this.viemPublicClient.client.watchContractEvent({
      address: factoryAddress as Address,
      abi: FactoryAbi,
      eventName: 'NewAdminAddress',
      onError: (error) => {
        this.logger.error('NewAdminAddress watcher error', error instanceof Error ? error.stack : String(error));
      },
      onLogs: async (logs) => {
        for (const log of logs) {
          await this.handleLog(log, 'live');
        }
      },
    });
  }

  onModuleDestroy() {
    this.unwatch?.();
    this.unwatch = undefined;
  }

  private async deleteAdminAddressCache() {
    try {
      // Delete the cached admin address in Redis
      await this.redisService.ensureConnected();
      await this.redisService.client.del(StoreKeys.FACTORY_ADMIN_ADDRESS);
      this.logger.log(`Admin address cache deleted in Redis`);
    } catch (error) {
      this.logger.error(
        'Error deleting admin address cache in Redis',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
  /**
   * Handle NewAdminAddress events
   * Updates the cached admin address in Redis when the admin address changes
   */
  async handleLog(log: NewAdminAddressEventsLog, mode: 'live' | 'backfill' = 'live') {
    const newAdminAddress = log?.args?.admin;

    console.log(
      `📢 NewAdminAddress event detected (${mode}):\n` +
        `  New Admin Address: ${newAdminAddress}\n` +
        `  Transaction: ${log?.transactionHash}\n` +
        `  Block: ${log?.blockNumber}`,
    );

    await this.deleteAdminAddressCache();
  }
}
