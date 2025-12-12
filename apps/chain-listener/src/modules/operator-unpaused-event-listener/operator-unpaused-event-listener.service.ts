import { FactoryAbi } from '@acme/smart-contract';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address } from 'viem';

import { createOperatorUnpausedQueue } from '@acme/queue';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import type { Env } from '../../schemas/env-validation-schema.js';

type Unwatch = () => void;

@Injectable()
export class OperatorUnpausedEventListenerService implements OnModuleInit, OnModuleDestroy {
  private unwatch?: Unwatch;
  private readonly logger = new Logger(OperatorUnpausedEventListenerService.name);
  private readonly operatorUnpausedQueue = createOperatorUnpausedQueue();

  constructor(
    private readonly viemPublicClient: ViemPublicClientService,
    private readonly configService: ConfigService<Env>,
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
            await this.operatorUnpausedQueue.add(
              'operator-unpaused',
              { log, mode: 'live' },
              { removeOnFail: false },
            );
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
   * Updates the operator isPaused status in the database and clears Redis cache
   */
  onModuleDestroy() {
    this.unwatch?.();
    this.unwatch = undefined;
  }
}
