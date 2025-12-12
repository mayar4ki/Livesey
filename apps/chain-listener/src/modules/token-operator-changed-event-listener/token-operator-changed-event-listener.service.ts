import { FactoryAbi } from '@acme/smart-contract';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address } from 'viem';

import { createTokenNewOperatorAddressQueue } from '@acme/queue';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import type { Env } from '../../schemas/env-validation-schema.js';

type Unwatch = () => void;

@Injectable()
export class TokenOperatorChangedEventListenerService implements OnModuleInit, OnModuleDestroy {
  private unwatch?: Unwatch;
  private readonly logger = new Logger(TokenOperatorChangedEventListenerService.name);
  private readonly tokenNewOperatorAddressQueue = createTokenNewOperatorAddressQueue();

  constructor(
    private readonly viemPublicClient: ViemPublicClientService,
    private readonly configService: ConfigService<Env>,
  ) {}

  onModuleInit() {
    this.logger.log('Starting TokenNewOperatorAddress listener');

    const factoryAddress = this.configService.get<string>('FACTORY_ADDRESS', {
      infer: true,
    });

    this.unwatch = this.viemPublicClient.client.watchContractEvent({
      address: factoryAddress as Address,
      abi: FactoryAbi,
      eventName: 'TokenNewOperatorAddress',
      onError: (error) => {
        this.logger.error(
          'TokenNewOperatorAddress watcher error',
          error instanceof Error ? error.stack : String(error),
        );
      },
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            await this.tokenNewOperatorAddressQueue.add(
              'token-new-operator-address',
              { log, mode: 'live' },
              { removeOnFail: false },
            );
          } catch (error) {
            this.logger.error(
              'TokenNewOperatorAddress handler failed',
              error instanceof Error ? error.stack : String(error),
            );
          }
        }
      },
    });

    this.logger.log('TokenNewOperatorAddress listener ready');
  }

  /**
   * Handle TokenNewOperatorAddress events
   * Updates the cached operator address in Redis when the operator address changes
   */
  onModuleDestroy() {
    this.unwatch?.();
    this.unwatch = undefined;
  }
}
