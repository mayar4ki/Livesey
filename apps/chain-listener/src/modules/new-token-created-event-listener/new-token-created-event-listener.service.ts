import { createTokenCreatedQueue } from '@acme/queue';
import { FactoryAbi } from '@acme/smart-contract';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address } from 'viem';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import type { Env } from '../../schemas/env-validation-schema.js';

type Unwatch = () => void;

@Injectable()
export class NewTokenCreatedEventListenerService implements OnModuleInit, OnModuleDestroy {
  private unwatch?: Unwatch;
  private readonly logger = new Logger(NewTokenCreatedEventListenerService.name);
  private readonly tokenCreatedQueue = createTokenCreatedQueue();

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly viemPublicClient: ViemPublicClientService,
  ) {}

  onModuleInit() {
    this.logger.log('Starting TokenCreated listener');

    const factoryAddress = this.configService.get<string>('FACTORY_ADDRESS', {
      infer: true,
    });

    this.unwatch = this.viemPublicClient.client.watchContractEvent({
      address: factoryAddress as Address,
      abi: FactoryAbi,
      eventName: 'TokenCreated',
      onError: (error) => {
        this.logger.error('TokenCreated watcher error', error instanceof Error ? error.stack : String(error));
      },
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            await this.tokenCreatedQueue.add('token-created', { log, mode: 'live' }, { removeOnFail: false });
          } catch (error) {
            this.logger.error('TokenCreated handler failed', error instanceof Error ? error.stack : String(error));
          }
        }
      },
    });

    this.logger.log('TokenCreated listener ready');
  }

  /**
   * Handle TokenCreated events
   * Processes multiple events and stores them in a single database transaction
   */
  onModuleDestroy() {
    this.unwatch?.();
    this.unwatch = undefined;
  }
}
