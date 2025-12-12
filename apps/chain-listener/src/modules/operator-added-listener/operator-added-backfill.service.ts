import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Address } from 'viem';

import { createOperatorAddedQueue, type OperatorAddedEventsLog } from '@acme/queue';
import { FactoryAbi } from '@acme/smart-contract';
import { ConfigService } from '@nestjs/config';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import { Env } from '../../schemas/env-validation-schema.js';

@Injectable()
export class OperatorAddedBackfillService implements OnModuleDestroy {
  private readonly logger = new Logger(OperatorAddedBackfillService.name);
  private readonly operatorAddedQueue = createOperatorAddedQueue();

  private reconcileTimer?: NodeJS.Timeout;
  private isReconciling = false;

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly viemPublicClient: ViemPublicClientService,
    private readonly watermarkService: WatermarkService,
  ) {}

  async reconcile() {
    const chainId = this.configService.get<string>('CHAIN_ID', {
      infer: true,
    })!;
    const factoryAddress = this.configService.get<string>('FACTORY_ADDRESS', {
      infer: true,
    })!;

    const watermark = await this.watermarkService.getWatermark({
      chainId: chainId,
      address: factoryAddress,
      eventName: 'OperatorAdded',
    });

    const latestBlock = await this.viemPublicClient.client.getBlockNumber();
    const reorgSafety = 2n;
    const toBlock = latestBlock > reorgSafety ? latestBlock - reorgSafety : latestBlock;
    const fromBlock = watermark ? watermark.block : toBlock;

    if (toBlock < fromBlock) {
      return;
    }

    const filter = await this.viemPublicClient.client.createContractEventFilter({
      address: factoryAddress as Address,
      abi: FactoryAbi,
      eventName: 'OperatorAdded',
      fromBlock,
      toBlock,
    });

    const logs = await this.viemPublicClient.client.getFilterLogs({
      filter,
    });

    const filteredLogs = watermark
      ? logs.filter((log) => {
          if (log.blockNumber === watermark.block) {
            const logIndex = Number(log.logIndex ?? -1);
            return logIndex > (watermark.logIndex ?? -1);
          }
          return log.blockNumber > watermark.block;
        })
      : logs;

    for (const log of filteredLogs) {
      await this.enqueueLog(log, 'backfill');
    }

    await this.viemPublicClient.client.uninstallFilter({ filter });
  }

  /**
   * Start the operator added backfill service.
   * @param intervalMs - The interval in milliseconds to reconcile the operator added events.
   * @default 3 minutes
   */
  initiateContinuousReconciliation(intervalMs: number = 3 * 60 * 1000) {
    this.reconcileTimer = setInterval(() => {
      if (this.isReconciling) return;

      this.isReconciling = true;
      this.reconcile()
        .catch((error) => {
          this.logger.error(
            'OperatorAdded reconciler error',
            error instanceof Error ? error.stack : String(error),
          );
        })
        .finally(() => {
          this.isReconciling = false;
        });
    }, intervalMs);
  }

  onModuleDestroy() {
    if (this.reconcileTimer) {
      clearInterval(this.reconcileTimer);
      this.reconcileTimer = undefined;
    }
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
