import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TokenEntity } from 'src/token/entities/token.entity';
import { BaseResponse } from '../lib/base.dto';
import { PrismaService } from '../lib/prisma/prisma.service';
import { CreateLimitOrderDto } from './dto/create-limit-order.dto';
import { LimitOrderListQueryDto } from './dto/list-query.dto';
import { LimitOrderEntity } from './entities/limit-order.entity';

@Injectable()
export class LimitOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLimitOrderDto, makerAddress: string) {
    // Check if order with this hash already exists
    const existingOrder = await this.prisma.client.limitOrder.findUnique({
      where: {
        orderHash_chainId: {
          orderHash: dto.orderHash,
          chainId: dto.chainId,
        },
      },
    });

    if (existingOrder) {
      throw new ConflictException('Limit order with this hash already exists');
    }

    // Note: Order hash and signature verification are handled by LimitOrderSignatureGuard
    // Expiration validation is handled by DTO validation
    // At this point, we can trust that the order is valid

    let token: TokenEntity | null = null;
    // Try to find token by makeToken first (token being sold)
    token = await this.prisma.client.token.findUnique({
      where: {
        token_chainId: {
          token: dto.makeToken,
          chainId: dto.chainId,
        },
      },
    });

    // If not found, try takeToken (token being bought)
    if (!token) {
      token = await this.prisma.client.token.findUnique({
        where: {
          token_chainId: {
            token: dto.takeToken,
            chainId: dto.chainId,
          },
        },
      });
    }

    if (!token) {
      throw new NotFoundException('Token not found');
    }

    // Create the limit order
    const limitOrder = await this.prisma.client.limitOrder.create({
      data: {
        orderHash: dto.orderHash,
        maker: makerAddress,
        makeToken: dto.makeToken.toLowerCase(),
        takeToken: dto.takeToken.toLowerCase(),
        makeAmount: dto.makeAmount,
        takeAmount: dto.takeAmount,
        signature: dto.signature,
        nonce: BigInt(dto.nonce),
        expiration: BigInt(dto.expiration),
        chainId: dto.chainId,
        status: 'pending',
        tokenId: token.id,
      },
    });

    return {
      data: limitOrder,
    };
  }

  async findAll(
    query: LimitOrderListQueryDto,
  ): Promise<BaseResponse<LimitOrderEntity[]>> {
    const {
      skip = 0,
      take = 10,
      status,
      makeToken,
      takeToken,
      chainId,
    } = query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (makeToken) {
      where.makeToken = makeToken.toLowerCase();
    }

    if (takeToken) {
      where.takeToken = takeToken.toLowerCase();
    }

    if (chainId) {
      where.chainId = chainId;
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

    const where: any = {
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
