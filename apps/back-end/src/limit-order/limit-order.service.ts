import { LimitOrderType, Prisma } from '@acme/db';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseResponse } from '../lib/base.dto';
import { PrismaService } from '../lib/prisma/prisma.service';
import { CreateLimitOrderDto } from './dto/create-limit-order.dto';
import { LimitOrderListQueryDto } from './dto/list-query.dto';
import { LimitOrderEntity } from './entities/limit-order.entity';

@Injectable()
export class LimitOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLimitOrderDto, makerAddress: string) {
    // Note: Order hash and signature verification are handled by LimitOrderSignatureGuard
    // Expiration validation is handled by DTO validation
    // At this point, we can trust that the order is valid

    const token = await this.prisma.client.token.findFirst({
      where: {
        chainId: dto.chainId,
        OR: [{ token: dto.makeToken }, { token: dto.takeToken }],
      },
    });

    if (!token) {
      throw new NotFoundException('token not found');
    }

    await this.prisma.client.token.update({
      where: {
        id: token.id,
      },
      data: {
        limitOrders: {
          create: {
            orderHash: dto.orderHash,
            maker: makerAddress,
            makeToken: dto.makeToken,
            takeToken: dto.takeToken,
            makeAmount: dto.makeAmount,
            remainingMakingAmount: dto.makeAmount,
            takeAmount: dto.takeAmount,
            signature: dto.signature,
            salt: dto.salt,
            nonce: BigInt(dto.nonce),
            expiration: BigInt(dto.expiration),
            chainId: dto.chainId,
            status: 'pending',
            type:
              dto.makeToken === token.token
                ? LimitOrderType.SELL
                : LimitOrderType.BUY,
          },
        },
      },
    });

    return {};
  }

  async findAll(
    query: LimitOrderListQueryDto,
  ): Promise<BaseResponse<LimitOrderEntity[]>> {
    const {
      skip = 0,
      take = 10,
      status,
      type,
      makeToken,
      takeToken,
      chainId,
      maker,
      search,
      sortBy,
      sortOrder = 'desc',
    } = query;

    // TODO this is not efficient, we should use a better way to search for tokens

    // If searching, find tokens that match the search term by name or symbol
    let matchingTokenAddresses: string[] = [];
    if (search) {
      const matchingTokens = await this.prisma.client.token.findMany({
        where: {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              symbol: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        },
        select: {
          token: true,
        },
      });
      matchingTokenAddresses = matchingTokens.map((t) => t.token);
    }

    const where: Prisma.LimitOrderWhereInput = {
      ...(status && { status }),
      ...(type && { type }),
      ...(makeToken && { makeToken }),
      ...(takeToken && { takeToken }),
      ...(chainId && { chainId }),
      ...(maker && { maker }),
      ...(search
        ? {
            OR: [
              {
                orderHash: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                maker: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                makeToken: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                takeToken: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                token: {
                  OR: [
                    {
                      name: {
                        contains: search,
                        mode: 'insensitive' as const,
                      },
                    },
                    {
                      symbol: {
                        contains: search,
                        mode: 'insensitive' as const,
                      },
                    },
                  ],
                },
              },
              ...(matchingTokenAddresses.length > 0
                ? [
                    {
                      makeToken: {
                        in: matchingTokenAddresses,
                      },
                    },
                    {
                      takeToken: {
                        in: matchingTokenAddresses,
                      },
                    },
                  ]
                : []),
            ],
          }
        : {}),
    };

    // Build orderBy clause based on sortBy and sortOrder
    const orderBy: Prisma.LimitOrderOrderByWithRelationInput = sortBy
      ? {
          [sortBy]: sortOrder,
        }
      : {
          createdAt: 'desc',
        };

    const [orders, total] = await Promise.all([
      this.prisma.client.limitOrder.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          token: {
            include: {
              seedData: true,
              operator: true,
            },
          },
        },
      }),
      this.prisma.client.limitOrder.count({
        where,
      }),
    ]);

    return {
      data: orders,
      pagination: {
        skip,
        take,
        total,
      },
    };
  }

  async findByToken(
    tokenAddress: string,
    chainId: number,
    query: LimitOrderListQueryDto,
  ): Promise<BaseResponse<LimitOrderEntity[]>> {
    const { skip = 0, take = 10, status } = query;

    // First, find the token to get its ID for efficient foreign key lookup
    const token = await this.prisma.client.token.findUnique({
      where: {
        token_chainId: {
          token: tokenAddress,
          chainId,
        },
      },
    });

    // Return early if token doesn't exist
    if (!token) {
      throw new NotFoundException('Token not found');
    }

    const where: Prisma.LimitOrderWhereInput = {
      tokenId: token.id,
      ...(status && { status }),
    };

    const [orders, total] = await Promise.all([
      this.prisma.client.limitOrder.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
        include: {
          token: {
            include: {
              seedData: true,
              operator: true,
            },
          },
        },
      }),
      this.prisma.client.limitOrder.count({
        where,
      }),
    ]);

    return {
      data: orders,
      pagination: {
        skip,
        take,
        total,
      },
    };
  }

  async findByMaker(
    makerAddress: string,
    query: LimitOrderListQueryDto,
  ): Promise<BaseResponse<LimitOrderEntity[]>> {
    const { skip = 0, take = 10, status } = query;

    const where: Prisma.LimitOrderWhereInput = {
      maker: makerAddress.toLowerCase(),
    };

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      this.prisma.client.limitOrder.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
        include: {
          token: {
            include: {
              seedData: true,
              operator: true,
            },
          },
        },
      }),
      this.prisma.client.limitOrder.count({
        where,
      }),
    ]);

    return {
      data: orders,
      pagination: {
        skip,
        take,
        total,
      },
    };
  }

  async findOne(
    orderHash: string,
    chainId: number,
  ): Promise<BaseResponse<LimitOrderEntity>> {
    const order = await this.prisma.client.limitOrder.findUnique({
      where: {
        orderHash_chainId: {
          orderHash,
          chainId,
        },
      },
      include: {
        token: {
          include: {
            seedData: true,
            operator: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Limit order not found');
    }

    return {
      data: order,
    };
  }

  async updateStatus(
    orderHash: string,
    chainId: number,
    status: 'pending' | 'filled' | 'cancelled' | 'expired',
  ) {
    const order = await this.prisma.client.limitOrder.findUnique({
      where: {
        orderHash_chainId: {
          orderHash,
          chainId,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Limit order not found');
    }

    await this.prisma.client.limitOrder.update({
      where: {
        orderHash_chainId: {
          orderHash,
          chainId,
        },
      },
      data: {
        status,
      },
    });

    return {};
  }

  async cancelOrder(orderHash: string, chainId: number, makerAddress: string) {
    const order = await this.prisma.client.limitOrder.findUnique({
      where: {
        orderHash_chainId: {
          orderHash,
          chainId,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Limit order not found');
    }

    // Verify the maker is the one cancelling
    if (order.maker.toLowerCase() !== makerAddress.toLowerCase()) {
      throw new BadRequestException(
        'Only the order maker can cancel this order',
      );
    }

    if (order.status !== 'pending') {
      throw new BadRequestException(
        `Cannot cancel order with status: ${order.status}`,
      );
    }

    await this.prisma.client.limitOrder.update({
      where: {
        orderHash_chainId: {
          orderHash,
          chainId,
        },
      },
      data: {
        status: 'cancelled',
      },
    });

    return {};
  }
}
