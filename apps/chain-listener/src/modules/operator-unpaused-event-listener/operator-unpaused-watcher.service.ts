import { FactoryAbi } from '@acme/smart-contract';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Address } from 'viem';

import { ConfigService } from '@nestjs/config';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import { Env } from '../../schemas/env-validation-schema.js';
import { OperatorUnpausedQueueService } from './operator-unpaused-queue.service.js';

type Unwatch = () => void;

@Injectable()
export class OperatorUnpausedWatcherService implements OnModuleDestroy {
  private readonly logger = new Logger(OperatorUnpausedWatcherService.name);
  private unwatch?: Unwatch;

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly viemPublicClient: ViemPublicClientService,
    private readonly queueService: OperatorUnpausedQueueService,
  ) {}

  init() {
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

