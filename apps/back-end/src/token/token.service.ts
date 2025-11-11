import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { createVerificationTask, getVerificationTask } from '@acme/queue';
import { PrismaService } from '../prisma/prisma.service';
import { ListQueryDto } from './dto/list-query.dto';
import { VerifyStatusQueryDto } from './dto/verify-status-query.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';

@Injectable()
export class TokenService {
  constructor(private readonly prisma: PrismaService) {}
  async verify(verifyTokenDto: VerifyTokenDto) {
    const task = await createVerificationTask(verifyTokenDto);

    if (!task) {
      throw new BadRequestException('Contract already verified');
    }

    return {
      contractAddress: task.contractAddress,
      chainId: task.chainId,
    };
  }
  async verifyStatus(query: VerifyStatusQueryDto) {
    const task = await getVerificationTask(
      query.chainId,
      query.contractAddress,
    );

    if (!task) {
      throw new NotFoundException('Verification task not found');
    }

    return {
      task,
    };
  }
  async list(query: ListQueryDto) {
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

    // Convert BigInt values to strings for JSON serialization
    const serializedTokens = tokens.map((token) => ({
      ...token,
      blockNumber: token.blockNumber.toString(),
    }));

    return {
      data: serializedTokens,
      pagination: {
        skip,
        take,
        total,
      },
    };
  }
}
