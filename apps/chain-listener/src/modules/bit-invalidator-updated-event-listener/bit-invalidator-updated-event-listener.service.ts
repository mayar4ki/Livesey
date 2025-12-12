import { ONEINCH_LIMIT_ORDER_PROTOCOL_ABI, oneInchLimitOrderProtocolAddresses } from '@acme/shared';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address } from 'viem';

import { createBitInvalidatorUpdatedQueue } from '@acme/queue';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import { Env } from '../../schemas/env-validation-schema.js';

type Unwatch = () => void;

@Injectable()
export class BitInvalidatorUpdatedEventListenerService implements OnModuleInit, OnModuleDestroy {
  private unwatch?: Unwatch;
  private readonly logger = new Logger(BitInvalidatorUpdatedEventListenerService.name);
  private readonly bitInvalidatorUpdatedQueue = createBitInvalidatorUpdatedQueue();

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly viemPublicClient: ViemPublicClientService,
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
            await this.bitInvalidatorUpdatedQueue.add(
              'bit-invalidator-updated',
              { log, mode: 'live' },
              { removeOnFail: false },
            );
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
  onModuleDestroy() {
    this.unwatch?.();
    this.unwatch = undefined;
  }
}
