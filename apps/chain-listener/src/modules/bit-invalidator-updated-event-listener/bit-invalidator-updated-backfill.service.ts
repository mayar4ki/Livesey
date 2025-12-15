import { ONEINCH_LIMIT_ORDER_PROTOCOL_ABI, oneInchLimitOrderProtocolAddresses } from '@acme/shared';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Address } from 'viem';

import { ConfigService } from '@nestjs/config';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import { Env } from '../../schemas/env-validation-schema.js';
import { BitInvalidatorUpdatedQueueService } from './bit-invalidator-updated-queue.service.js';

@Injectable()
export class BitInvalidatorUpdatedBackfillService implements OnModuleDestroy {
  private readonly logger = new Logger(BitInvalidatorUpdatedBackfillService.name);

  private reconcileTimer?: NodeJS.Timeout;
  private isReconciling = false;

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly viemPublicClient: ViemPublicClientService,
    private readonly watermarkService: WatermarkService,
    private readonly queueService: BitInvalidatorUpdatedQueueService,
  ) {}

  private getConfig() {
    const chunkSizeEnv = this.configService.get<number>('BIT_INVALIDATOR_UPDATED_BACKFILL_CHUNK_SIZE', {
      infer: true,
    });
    const intervalEnv = this.configService.get<number>('BIT_INVALIDATOR_UPDATED_BACKFILL_INTERVAL_MS', {
      infer: true,
    });
    const defaultBlockRangeEnv = this.configService.get<number>(
      'BIT_INVALIDATOR_UPDATED_BACKFILL_DEFAULT_BLOCK_RANGE',
      {
        infer: true,
      },
    );
    const chainId = this.configService.get<string>('CHAIN_ID', { infer: true })!;

    return {
      chainId,
      lopAddress: oneInchLimitOrderProtocolAddresses[chainId] as Address,
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
    const { chainId, lopAddress, chunkSize } = this.getConfig();
    const bitInvalidatorUpdatedEvent = ONEINCH_LIMIT_ORDER_PROTOCOL_ABI.find(
      (item) => item.type === 'event' && item.name === 'BitInvalidatorUpdated',
    );

    if (!bitInvalidatorUpdatedEvent) {
      this.logger.error('BitInvalidatorUpdated event ABI not found; skipping backfill');
      return;
    }

    const watermark = await this.watermarkService.getWatermark({
      chainId,
      address: lopAddress,
      eventName: 'BitInvalidatorUpdated',
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
        address: lopAddress,
        events: [bitInvalidatorUpdatedEvent],
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
        `BitInvalidatorUpdated backfill chunk ${cursor}→${chunkEnd} fetched=${logs.length} filtered=${filteredLogs.length}`,
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
            'BitInvalidatorUpdated reconciler error',
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
