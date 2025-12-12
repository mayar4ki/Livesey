import { FactoryAbi } from '@acme/smart-contract';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address } from 'viem';

import { createOperatorPausedQueue } from '@acme/queue';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import type { Env } from '../../schemas/env-validation-schema.js';

type Unwatch = () => void;

@Injectable()
export class OperatorPausedEventListenerService implements OnModuleInit, OnModuleDestroy {
  private unwatch?: Unwatch;
  private readonly logger = new Logger(OperatorPausedEventListenerService.name);
  private readonly operatorPausedQueue = createOperatorPausedQueue();

  constructor(
    private readonly viemPublicClient: ViemPublicClientService,
    private readonly configService: ConfigService<Env>,
  ) {}

  onModuleInit() {
    this.logger.log('Starting OperatorPaused listener');

    const factoryAddress = this.configService.get<string>('FACTORY_ADDRESS', {
      infer: true,
    });

    this.unwatch = this.viemPublicClient.client.watchContractEvent({
      address: factoryAddress as Address,
      abi: FactoryAbi,
      eventName: 'OperatorPaused',
      onError: (error) => {
        this.logger.error('OperatorPaused watcher error', error instanceof Error ? error.stack : String(error));
      },
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            await this.operatorPausedQueue.add(
              'operator-paused',
              { log, mode: 'live' },
              { removeOnFail: false },
            );
          } catch (error) {
            this.logger.error(
              'OperatorPaused handler failed',
              error instanceof Error ? error.stack : String(error),
            );
          }
        }
      },
    });

    this.logger.log('OperatorPaused listener ready');
  }

  /**
   * Handle OperatorPaused events
   * Updates the operator isPaused status in the database and clears Redis cache
   */
  onModuleDestroy() {
    this.unwatch?.();
    this.unwatch = undefined;
  }
}
