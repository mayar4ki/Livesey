import { Prisma } from '@acme/db';
import { Injectable, NotFoundException } from '@nestjs/common';

import { getSeedDataKey } from '@acme/queue';
import { BaseResponse } from 'src/lib/base.dto';
import { PrismaService } from '../lib/prisma/prisma.service';
import { RedisService } from '../lib/redis/redis.service';
import { ListQueryDto } from './dto/list-query.dto';
import { StorePendingSeedDto } from './dto/store-seed.dto';
import { TokenEntity } from './entities/token.entity';

@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}
  async findOne(id: string): Promise<BaseResponse<TokenEntity>> {
    const token = await this.prisma.client.token.findUnique({
      where: { id },
      include: {
        seedData: true,
        operator: true,
      },
    });

    if (!token) {
      throw new NotFoundException('Token not found');
    }

    return {
      data: token,
    };
  }
  async findOneByAddress(
    address: string,
    chainId: number,
  ): Promise<BaseResponse<TokenEntity>> {
    const token = await this.prisma.client.token.findUnique({
      where: {
        token_chainId: {
          token: address,
          chainId: chainId,
        },
      },
      include: {
        seedData: true,
        operator: true,
      },
    });

    if (!token) {
      throw new NotFoundException('Token not found');
    }

    return {
      data: token,
    };
  }

  async list(query: ListQueryDto): Promise<BaseResponse<TokenEntity[]>> {
    const { skip = 0, take = 10, search, operator } = query;

    const where: Prisma.TokenWhereInput = {
      ...(search
        ? {
            OR: [
              {
                token: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                createdBy: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
      ...(operator
        ? {
            operator: {
              address: {
                equals: operator,
                mode: 'insensitive',
              },
            },
          }
        : {}),
    };

    const [tokens, total] = await Promise.all([
      this.prisma.client.token.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
        include: {
          seedData: true,
          operator: true,
        },
      }),
      this.prisma.client.token.count({
        where,
      }),
    ]);

    return {
      data: tokens,
      pagination: {
        skip,
        take,
        total,
      },
    };
  }

  async storePendingSeed(dto: StorePendingSeedDto) {
    await this.redis.ensureConnected();

    // Store seed data in Redis with 30 minutes TTL (1800 seconds)
    const seedKey = getSeedDataKey(dto.assetRefHash);
    const seedValue = JSON.stringify(dto.seedData);

    // SETEX sets key with expiration time in seconds
    await this.redis.client.setEx(seedKey, 1800, seedValue);

    return {};
  }
}
