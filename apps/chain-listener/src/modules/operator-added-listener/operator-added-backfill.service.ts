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

  private getConfig() {
    return {
      chainId: this.configService.get<string>('CHAIN_ID', { infer: true })!,
      factoryAddress: this.configService.get<string>('FACTORY_ADDRESS', { infer: true })!,
    };
  }

  private async getWatermark(chainId: string, factoryAddress: string) {
    return this.watermarkService.getWatermark({
      chainId,
      address: factoryAddress,
      eventName: 'OperatorAdded',
    });
  }

  private filterLogsByWatermark(
    logs: OperatorAddedEventsLog[],
    watermark: Awaited<ReturnType<typeof this.getWatermark>>,
    isFirstChunk: boolean,
  ) {
    if (!watermark || !isFirstChunk) {
      return logs;
    }

    return logs.filter((log) => {
      if (log.blockNumber === watermark.block) {
        const logIndex = Number(log.logIndex ?? -1);
        return logIndex > (watermark.logIndex ?? -1);
      }
      return log.blockNumber > watermark.block;
    });
  }

  private async calculateBlockRange(watermark: Awaited<ReturnType<typeof this.getWatermark>>) {
    const latestBlock = await this.viemPublicClient.client.getBlockNumber();
    const reorgSafety = 2n;
    const toBlock = latestBlock > reorgSafety ? latestBlock - reorgSafety : latestBlock;
    const fromBlock = watermark ? watermark.block : toBlock;
    return { fromBlock, toBlock };
  }

  private getOperatorAddedEvent() {
    const event = FactoryAbi.find((item) => item.type === 'event' && item.name === 'OperatorAdded');
    if (!event) {
      this.logger.error('OperatorAdded event ABI not found; skipping backfill');
    }
    return event;
  }

  private async processLogsInChunks(
    factoryAddress: string,
    operatorAddedEvent: NonNullable<ReturnType<typeof this.getOperatorAddedEvent>>,
    fromBlock: bigint,
    toBlock: bigint,
    watermark: Awaited<ReturnType<typeof this.getWatermark>>,
  ) {
    const chunkSize = 2_000n;
    let cursor = fromBlock;

    while (cursor <= toBlock) {
      const chunkEnd = cursor + chunkSize - 1n > toBlock ? toBlock : cursor + chunkSize - 1n;

      const logs = await this.viemPublicClient.client.getLogs({
        address: factoryAddress as Address,
        events: [operatorAddedEvent],
        fromBlock: cursor,
        toBlock: chunkEnd,
      });
      const filteredLogs = this.filterLogsByWatermark(logs, watermark, cursor === fromBlock);
      await this.enqueueLogs(filteredLogs);
      cursor = chunkEnd + 1n;
    }
  }

  /**
   * Reconcile the event logs.
   */
  async reconcile() {
    const { chainId, factoryAddress } = this.getConfig();
    const watermark = await this.getWatermark(chainId, factoryAddress);
    const { fromBlock, toBlock } = await this.calculateBlockRange(watermark);

    if (toBlock < fromBlock) {
      return;
    }

    const operatorAddedEvent = this.getOperatorAddedEvent();
    if (!operatorAddedEvent) {
      return;
    }

    await this.processLogsInChunks(factoryAddress, operatorAddedEvent, fromBlock, toBlock, watermark);
  }

  /**
   * Start the continuous reconciliation of the event logs.
   * @param intervalMs - The interval in milliseconds to reconcile the event events.
   * @default 15 minutes
   */
  initiateContinuousReconciliation(intervalMs: number = 15 * 60 * 1000) {
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

  private async enqueueLogs(logs: OperatorAddedEventsLog[]) {
    for (const log of logs) {
      await this.enqueueLog(log, 'backfill');
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
