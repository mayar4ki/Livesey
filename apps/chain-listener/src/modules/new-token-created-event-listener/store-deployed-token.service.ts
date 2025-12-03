import { getSeedDataKey } from '@acme/queue';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/schemas/env-validation-schema.js';
import { PrismaService } from '../../lib/prisma/prisma.service.js';
import { RedisService } from '../../lib/redis/redis.service.js';
import { ValidatedLog } from '../../schemas/token-created-validation.js';

@Injectable()
export class StoreDeployedTokenService {
  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Store deployed token in PostgreSQL database
   * Also retrieves seed data from Redis if available
   */
  public async storeDeployedToken(log: ValidatedLog): Promise<void> {
    await this.redisService.ensureConnected();

    const token = log.args;

    // Retrieve seed data from Redis for all tokens (outside transaction)
    let seedData;

    const SEED_DATA_KEY = getSeedDataKey(token.assetRefHash);
    try {
      const seedValue = await this.redisService.client.get(SEED_DATA_KEY);
      if (!seedValue) {
        throw new Error(`Seed data not found in Redis for assetRefHash: ${token.assetRefHash}`);
      }
      seedData = JSON.parse(seedValue);
      // Delete seed from Redis after retrieving (cleanup)
      await this.redisService.client.del(SEED_DATA_KEY);
      console.log(`✅ Retrieved seed data for token ${token.token}`);
    } catch (error) {
      console.error(`❌ Failed to retrieve seed data for ${token.assetRefHash}:`, error);
      throw new Error(
        `Cannot store token ${token.token}: seed data is required but not found in Redis for assetRefHash ${token.assetRefHash}`,
      );
    }

    // Store tokens with seed data in database transaction

    const chainId = this.configService.get('CHAIN_ID', { infer: true }) ?? 11155111;

    await this.prismaService.client.token.upsert({
      where: {
        token_chainId: {
          token: token.token,
          chainId: chainId,
        },
      },
      update: {
        // Update if it already exists (shouldn't happen, but handle gracefully)
        token: token.token,

        name: token.name,
        symbol: token.symbol,
        totalSupply: token.totalSupply.toString(),

        assetRefHash: token.assetRefHash,
        createdBy: token.createdBy,
        operator: token.operator,

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
        operator: token.operator,

        chainId: chainId,
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,

        seedData: { create: { data: seedData } },
      },
    });

    console.log(`✅ Token ${token} Stored in db`);
  }
}
