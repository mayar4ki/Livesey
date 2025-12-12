import { StoreKeys } from '@acme/cache';
import { FactoryAbi } from '@acme/smart-contract';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WatchContractEventOnLogsParameter } from 'viem';
import { RedisService } from '../../lib/redis/redis.service.js';
import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import { Env } from '../../schemas/env-validation-schema.js';

type NewAdminAddressEventsLog = WatchContractEventOnLogsParameter<typeof FactoryAbi, 'NewAdminAddress'>[number];

@Injectable()
export class NewAdminAddressEventListenerService {
  private readonly logger = new Logger(NewAdminAddressEventListenerService.name);

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly redisService: RedisService,
    private readonly watermarkService: WatermarkService,
  ) {}

  /**
   * Handle NewAdminAddress events
   * Updates the cached admin address in Redis when the admin address changes
   */
  async handleLog(log: NewAdminAddressEventsLog, mode: 'live' | 'backfill' = 'live') {
    const chainId = this.configService.get('CHAIN_ID', { infer: true }) ?? 11155111;
    const newAdminAddress = log?.args?.admin;

    console.log(
      `📢 NewAdminAddress event detected (${mode}):\n` +
        `  New Admin Address: ${newAdminAddress}\n` +
        `  Transaction: ${log?.transactionHash}\n` +
        `  Block: ${log?.blockNumber}`,
    );

    try {
      // Delete the cached admin address in Redis
      if (newAdminAddress) {
        await this.redisService.ensureConnected();
        await this.redisService.client.del(StoreKeys.FACTORY_ADMIN_ADDRESS);
        console.log(`✅ Admin address cache deleted in Redis`);
      } else {
        throw Error('admin address not found');
      }

      const logIndex = log.logIndex !== null && log.logIndex !== undefined ? Number(log.logIndex) : undefined;
      if (log.blockNumber !== null && log.blockNumber !== undefined) {
        await this.watermarkService.setIfNewer(
          {
            chainId,
            address: log.address,
            eventName: 'NewAdminAddress',
          },
          {
            block: log.blockNumber,
            logIndex,
            txHash: log.transactionHash,
          },
        );
      }
    } catch (error) {
      // Don't throw - continue listening to other events
      console.error(
        `❌ Error deleting admin address cache in Redis:`,
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }
}
