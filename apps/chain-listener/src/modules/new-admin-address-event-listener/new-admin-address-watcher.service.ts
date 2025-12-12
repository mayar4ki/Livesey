import { FactoryAbi } from '@acme/smart-contract';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Address } from 'viem';

import { ConfigService } from '@nestjs/config';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import { Env } from '../../schemas/env-validation-schema.js';
import { NewAdminAddressEventListenerService } from './new-admin-address-event-listener.service.js';

type Unwatch = () => void;

@Injectable()
export class NewAdminAddressWatcherService implements OnModuleDestroy {
  private readonly logger = new Logger(NewAdminAddressWatcherService.name);
  private unwatch?: Unwatch;

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly viemPublicClient: ViemPublicClientService,
    private readonly listenerService: NewAdminAddressEventListenerService,
  ) {}

  init() {
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
          await this.listenerService.handleLog(log, 'live');
        }
      },
    });
  }

  onModuleDestroy() {
    this.unwatch?.();
    this.unwatch = undefined;
  }
}
