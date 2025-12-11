import { Prisma } from '@acme/db';
import { Injectable } from '@nestjs/common';
import { BaseResponse } from '../lib/base.dto';
import { PrismaService } from '../lib/prisma/prisma.service';
import { OperatorListQueryDto } from './dto/list-query.dto';
import { UpdateOperatorNameDto } from './dto/update-operator-name.dto';
import { OperatorEntity } from './entities/operator.entity';

@Injectable()
export class OperatorService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    query: OperatorListQueryDto,
  ): Promise<BaseResponse<OperatorEntity[]>> {
    const { skip = 0, take = 10, search, chainId } = query;

    const where: Prisma.OperatorWhereInput = {
      ...(chainId ? { chainId } : {}),
      ...(search
        ? {
            OR: [
              {
                address: { contains: search, mode: 'insensitive' },
              },
              {
                name: { contains: search, mode: 'insensitive' },
              },
            ],
          }
        : {}),
    };

    const [operators, total] = await Promise.all([
      this.prisma.client.operator.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.client.operator.count({
        where,
      }),
    ]);

    return {
      data: operators,
      pagination: {
        skip,
        take,
        total,
      },
    };
  }

  async findOne(
    address: string,
    chainId: number,
  ): Promise<BaseResponse<OperatorEntity>> {
    const operator = await this.prisma.client.operator.findUniqueOrThrow({
      where: {
        address_chainId: {
          address,
          chainId,
        },
      },
    });

    return { data: operator };
  }

  async updateName(
    address: string,
    chainId: number,
    dto: UpdateOperatorNameDto,
  ): Promise<{}> {
    await this.prisma.client.operator.update({
      where: {
        address_chainId: {
          address,
          chainId,
        },
      },
      data: {
        name: dto.name,
      },
    });

    return {};
  }
}
