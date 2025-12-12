import { FactoryAbi } from '@acme/smart-contract';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address } from 'viem';

import { createOperatorAddedQueue } from '@acme/queue';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import { Env } from '../../schemas/env-validation-schema.js';

type Unwatch = () => void;

@Injectable()
export class OperatorAddedEventListenerService implements OnModuleInit, OnModuleDestroy {
  private unwatch?: Unwatch;
  private readonly logger = new Logger(OperatorAddedEventListenerService.name);
  private readonly operatorAddedQueue = createOperatorAddedQueue();

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly viemPublicClient: ViemPublicClientService,
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
            await this.operatorAddedQueue.add(
              'operator-added',
              { log, mode: 'live' },
              {
                removeOnFail: false,
              },
            );
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
  onModuleDestroy() {
    this.unwatch?.();
    this.unwatch = undefined;
  }
}
