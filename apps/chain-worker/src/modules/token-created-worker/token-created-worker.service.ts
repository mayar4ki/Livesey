import { getSeedDataKey } from '@acme/cache';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';

import { tokenCreatedQueueName, type TokenCreatedJob } from '@acme/queue';
import { PrismaService } from '../../lib/prisma/prisma.service.js';
import { RedisService } from '../../lib/redis/redis.service.js';
import type { Env } from '../../schemas/env-validation-schema.js';
import { validateLog } from '../../schemas/token-created-validation.js';
import { QueueVerificationTaskService } from './queue-verification-task.service.js';
import type { TokenCreatedEventsLog } from './types.js';

@Injectable()
export class TokenCreatedWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TokenCreatedWorkerService.name);
  private worker?: Worker<TokenCreatedJob>;

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly queueVerificationTaskService: QueueVerificationTaskService,
  ) {}

  async onModuleInit() {
    this.worker = new Worker<TokenCreatedJob>(
      tokenCreatedQueueName,
      async (job) => this.process(job.data.log, job.data.mode),
      {
        connection: { url: this.configService.get<string>('REDIS_URL') },
        concurrency: 3,
      },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(
        `TokenCreated job failed tx=${job?.data?.log?.transactionHash ?? 'unknown'}`,
        err instanceof Error ? err.stack : String(err),
      );
    });

    this.worker.on('completed', (job) => {
      this.logger.log(`TokenCreated job completed id=${job.id}`);
    });

    this.logger.log('TokenCreated worker started');
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.worker = undefined;
      this.logger.log('TokenCreated worker stopped');
    }
  }

  /**
   * Handle TokenCreated events
   * Processes multiple events and stores them in a single database transaction
   */
  private async process(log: TokenCreatedEventsLog, mode: 'live' | 'backfill' = 'live') {
    console.log(
      `📢 TokenCreated event detected (${mode}):\n` +
        `  Token: ${log?.args?.token}\n` +
        `  Deployer: ${log?.args?.createdBy}\n` +
        `  Name: ${log?.args?.name}\n` +
        `  Symbol: ${log?.args?.symbol}\n` +
        `  Asset Ref Hash: ${log?.args?.assetRefHash}\n` +
        `  Total Supply: ${log?.args?.totalSupply}\n` +
        `  Transaction: ${log?.transactionHash}\n` +
        `  Block: ${log?.blockNumber}`,
    );

    try {
      const validLog = validateLog(log as any);
      await this.storeDeployedToken(validLog);
      await this.queueVerificationTaskService.queueVerificationTask(validLog);
    } catch (error) {
      console.error(
        `❌ Error storing deployed tokens in database:`,
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }

  private async storeDeployedToken(log: ReturnType<typeof validateLog>): Promise<void> {
    await this.redisService.ensureConnected();

    const token = log.args;
    let seedData;

    const SEED_DATA_KEY = getSeedDataKey(token.assetRefHash);
    try {
      const seedValue = await this.redisService.client.get(SEED_DATA_KEY);
      if (!seedValue) {
        throw new Error(`Seed data not found in Redis for assetRefHash: ${token.assetRefHash}`);
      }
      seedData = JSON.parse(seedValue);
      await this.redisService.client.del(SEED_DATA_KEY);
      console.log(`✅ Retrieved seed data for token ${token.token}`);
    } catch (error) {
      console.error(`❌ Failed to retrieve seed data for ${token.assetRefHash}:`, error);
      throw new Error(
        `Cannot store token ${token.token}: seed data is required but not found in Redis for assetRefHash ${token.assetRefHash}`,
      );
    }

    const chainId = this.configService.get<number>('CHAIN_ID', { infer: true }) ?? 11155111;

    const operator = await this.prismaService.client.operator.upsert({
      where: {
        address_chainId: {
          address: token.operator,
          chainId: chainId,
        },
      },
      update: {},
      create: {
        address: token.operator,
        chainId: chainId,
        name: '',
      },
    });

    await this.prismaService.client.token.upsert({
      where: {
        token_chainId: {
          token: token.token,
          chainId: chainId,
        },
      },
      update: {
        token: token.token,
        name: token.name,
        symbol: token.symbol,
        totalSupply: token.totalSupply.toString(),
        assetRefHash: token.assetRefHash,
        createdBy: token.createdBy,
        operatorId: operator.id,
        chainId: chainId,
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
        seedData: {
          upsert: {
            create: { data: seedData },
            update: { data: seedData },
          },
        },
      },
      create: {
        token: token.token,
        name: token.name,
        symbol: token.symbol,
        totalSupply: token.totalSupply.toString(),
        assetRefHash: token.assetRefHash,
        createdBy: token.createdBy,
        operatorId: operator.id,
        chainId: chainId,
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
        seedData: { create: { data: seedData } },
      },
    });

    console.log(`✅ Token ${token.token} stored in db`);
  }
}
