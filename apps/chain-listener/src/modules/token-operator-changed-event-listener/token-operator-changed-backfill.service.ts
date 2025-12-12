import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Address } from 'viem';

import { FactoryAbi } from '@acme/smart-contract';
import { ConfigService } from '@nestjs/config';
import { ViemPublicClientService } from '../../lib/viem/viem.service.js';
import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import { Env } from '../../schemas/env-validation-schema.js';
import { TokenOperatorChangedQueueService } from './token-operator-changed-queue.service.js';

@Injectable()
export class TokenOperatorChangedBackfillService implements OnModuleDestroy {
  private readonly logger = new Logger(TokenOperatorChangedBackfillService.name);

  private reconcileTimer?: NodeJS.Timeout;
  private isReconciling = false;

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly viemPublicClient: ViemPublicClientService,
    private readonly watermarkService: WatermarkService,
    private readonly queueService: TokenOperatorChangedQueueService,
  ) {}

  private getConfig() {
    const chunkSizeEnv = this.configService.get<number>('TOKEN_OPERATOR_CHANGED_BACKFILL_CHUNK_SIZE', {
      infer: true,
    });
    const intervalEnv = this.configService.get<number>('TOKEN_OPERATOR_CHANGED_BACKFILL_INTERVAL_MS', {
      infer: true,
    });

    return {
      chainId: this.configService.get<string>('CHAIN_ID', { infer: true })!,
      factoryAddress: this.configService.get<string>('FACTORY_ADDRESS', { infer: true })!,
      chunkSize: chunkSizeEnv ? BigInt(chunkSizeEnv) : 2_000n,
      intervalMs: intervalEnv ?? 15 * 60 * 1000,
    };
  }

  private async calculateBlockRange(watermark: Awaited<ReturnType<typeof this.watermarkService.getWatermark>>) {
    const latestBlock = await this.viemPublicClient.client.getBlockNumber();
    const reorgSafety = 2n;
    const toBlock = latestBlock > reorgSafety ? latestBlock - reorgSafety : latestBlock;
    const fromBlock = watermark?.block ?? toBlock;
    return { fromBlock, toBlock };
  }

  /**
   * Reconcile the event logs.
   */
  async reconcile() {
    const { chainId, factoryAddress, chunkSize } = this.getConfig();
    const tokenNewOperatorAddressEvent = FactoryAbi.find(
      (item) => item.type === 'event' && item.name === 'TokenNewOperatorAddress',
    );

    if (!tokenNewOperatorAddressEvent) {
      this.logger.error('TokenNewOperatorAddress event ABI not found; skipping backfill');
      return;
    }

    const watermark = await this.watermarkService.getWatermark({
      chainId,
      address: factoryAddress,
      eventName: 'TokenNewOperatorAddress',
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
        events: [tokenNewOperatorAddressEvent],
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
        `TokenNewOperatorAddress backfill chunk ${cursor}→${chunkEnd} fetched=${logs.length} filtered=${filteredLogs.length}`,
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
            'TokenNewOperatorAddress reconciler error',
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
