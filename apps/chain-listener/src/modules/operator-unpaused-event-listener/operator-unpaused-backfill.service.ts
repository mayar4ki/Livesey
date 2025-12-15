import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Address } from 'viem';

import { FactoryAbi } from '@acme/smart-contract';
import { ConfigService } from '@nestjs/config';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import { Env } from '../../schemas/env-validation-schema.js';
import { OperatorUnpausedQueueService } from './operator-unpaused-queue.service.js';

@Injectable()
export class OperatorUnpausedBackfillService implements OnModuleDestroy {
  private readonly logger = new Logger(OperatorUnpausedBackfillService.name);

  private reconcileTimer?: NodeJS.Timeout;
  private isReconciling = false;

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly viemPublicClient: ViemPublicClientService,
    private readonly watermarkService: WatermarkService,
    private readonly queueService: OperatorUnpausedQueueService,
  ) {}

  private getConfig() {
    const chunkSizeEnv = this.configService.get<number>('OPERATOR_UNPAUSED_BACKFILL_CHUNK_SIZE', { infer: true });
    const intervalEnv = this.configService.get<number>('OPERATOR_UNPAUSED_BACKFILL_INTERVAL_MS', { infer: true });
    const defaultBlockRangeEnv = this.configService.get<number>('OPERATOR_UNPAUSED_BACKFILL_DEFAULT_BLOCK_RANGE', {
      infer: true,
    });

    return {
      chainId: this.configService.get<string>('CHAIN_ID', { infer: true })!,
      factoryAddress: this.configService.get<string>('FACTORY_ADDRESS', { infer: true })!,
      chunkSize: chunkSizeEnv ? BigInt(chunkSizeEnv) : 5n,
      intervalMs: intervalEnv ?? 15 * 60 * 1000,
      defaultBlockRange: defaultBlockRangeEnv ? BigInt(defaultBlockRangeEnv) : 5n,
    };
  }

  private async calculateBlockRange(watermark: Awaited<ReturnType<typeof this.watermarkService.getWatermark>>) {
    const { defaultBlockRange } = this.getConfig();
    const latestBlock = await this.viemPublicClient.client.getBlockNumber();
    const reorgSafety = 2n;
    const toBlock = latestBlock - reorgSafety;
    const fromBlock = watermark?.block ?? toBlock - defaultBlockRange;

    return { fromBlock, toBlock };
  }

  /**
   * Reconcile the event logs.
   */
  async reconcile() {
    const { chainId, factoryAddress, chunkSize } = this.getConfig();
    const operatorUnpausedEvent = FactoryAbi.find(
      (item) => item.type === 'event' && item.name === 'OperatorUnpaused',
    );

    if (!operatorUnpausedEvent) {
      this.logger.error('OperatorUnpaused event ABI not found; skipping backfill');
      return;
    }

    const watermark = await this.watermarkService.getWatermark({
      chainId,
      address: factoryAddress,
      eventName: 'OperatorUnpaused',
    });

    const { fromBlock, toBlock } = await this.calculateBlockRange(watermark);

    if (toBlock < fromBlock) {
      return;
    }

    let cursor = fromBlock;
    let isFirstChunk = true;

    while (cursor <= toBlock) {
      const chunkEnd = cursor + chunkSize - 1n > toBlock ? toBlock : cursor + chunkSize - 1n;

      const logs = await this.viemPublicClient.client.getLogs({
        address: factoryAddress as Address,
        events: [operatorUnpausedEvent],
        fromBlock: cursor,
        toBlock: chunkEnd,
      });

      const filteredLogs =
        watermark && isFirstChunk
          ? logs.filter((log) => {
              if (log.blockNumber === watermark.block) {
                return BigInt(log.logIndex ?? -1) > BigInt(watermark.logIndex ?? -1);
              }
              return log.blockNumber > watermark.block;
            })
          : logs;

      this.logger.debug(
        `OperatorUnpaused backfill chunk ${cursor}→${chunkEnd} fetched=${logs.length} filtered=${filteredLogs.length}`,
      );
      if (filteredLogs.length > 0) {
        await this.queueService.enqueueLogs(filteredLogs, 'backfill');
      }

      cursor = chunkEnd + 1n;
      isFirstChunk = false;
    }
  }

  /**
   * Start the continuous reconciliation of the event logs.
   * @param intervalMs - The interval in milliseconds to reconcile the event logs.
   * @default 15 minutes
   */
  initiateContinuousReconciliation(intervalMs?: number) {
    const interval = intervalMs ?? this.getConfig().intervalMs;
    this.reconcileTimer = setInterval(() => {
      if (this.isReconciling) return;

      this.isReconciling = true;
      this.reconcile()
        .catch((error) => {
          this.logger.error(
            'OperatorUnpaused reconciler error',
            error instanceof Error ? error.stack : String(error),
          );
        })
        .finally(() => {
          this.isReconciling = false;
        });
    }, interval);
  }

  onModuleDestroy() {
    if (this.reconcileTimer) {
      clearInterval(this.reconcileTimer);
      this.reconcileTimer = undefined;
    }
  }
}
