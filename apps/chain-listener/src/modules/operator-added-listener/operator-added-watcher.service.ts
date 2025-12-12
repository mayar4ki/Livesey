import { FactoryAbi } from '@acme/smart-contract';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Address } from 'viem';

import { createOperatorAddedQueue, type OperatorAddedEventsLog } from '@acme/queue';
import { ConfigService } from '@nestjs/config';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import { Env } from '../../schemas/env-validation-schema.js';

type Unwatch = () => void;

@Injectable()
export class OperatorAddedWatcherService implements OnModuleDestroy {
  private readonly logger = new Logger(OperatorAddedWatcherService.name);
  private unwatch?: Unwatch;
  private readonly operatorAddedQueue = createOperatorAddedQueue();

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly viemPublicClient: ViemPublicClientService,
  ) {}

  init() {
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
          await this.enqueueLog(log, 'live');
        }
      },
    });
  }

  onModuleDestroy() {
    this.unwatch?.();
    this.unwatch = undefined;
  }

  private async enqueueLog(log: OperatorAddedEventsLog, mode: 'live' | 'backfill') {
    try {
      const jobId = `${log.transactionHash}:${log.logIndex ?? 0}`;
      await this.operatorAddedQueue.add(
        'operator-added',
        { log, mode },
        {
          removeOnFail: false,
          jobId,
        },
      );
    } catch (error) {
      this.logger.error('OperatorAdded handler failed', error instanceof Error ? error.stack : String(error));
    }
  }
}
