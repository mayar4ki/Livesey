import { Injectable, NotFoundException } from '@nestjs/common';

import { getSeedDataKey } from '@acme/queue';
import { BaseResponse } from 'src/lib/base.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
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
    const token = await this.prisma.client.deployedToken.findUnique({
      where: { id },
      include: {
        seedData: true,
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
    const { skip = 0, take = 10, search } = query;

    const where = search
      ? {
          OR: [
            {
              contractAddress: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              deployerAddress: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    const [tokens, total] = await Promise.all([
      this.prisma.client.deployedToken.findMany({
        where,
        orderBy: {
          deployedAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.client.deployedToken.count({
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
