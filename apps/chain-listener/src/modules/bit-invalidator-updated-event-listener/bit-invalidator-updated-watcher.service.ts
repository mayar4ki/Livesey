import { ONEINCH_LIMIT_ORDER_PROTOCOL_ABI, oneInchLimitOrderProtocolAddresses } from '@acme/shared';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Address } from 'viem';

import { ConfigService } from '@nestjs/config';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import { Env } from '../../schemas/env-validation-schema.js';
import { BitInvalidatorUpdatedQueueService } from './bit-invalidator-updated-queue.service.js';

type Unwatch = () => void;

@Injectable()
export class BitInvalidatorUpdatedWatcherService implements OnModuleDestroy {
  private readonly logger = new Logger(BitInvalidatorUpdatedWatcherService.name);
  private unwatch?: Unwatch;

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly viemPublicClient: ViemPublicClientService,
    private readonly queueService: BitInvalidatorUpdatedQueueService,
  ) {}

  init() {
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
          await this.queueService.enqueueLog(log, 'live');
        }
      },
    });
  }

  onModuleDestroy() {
    this.unwatch?.();
    this.unwatch = undefined;
  }
}

