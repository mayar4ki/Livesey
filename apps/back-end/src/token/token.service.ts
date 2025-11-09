import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { createVerificationTask, getVerificationTask } from '@acme/queue';
import { PrismaService } from '../prisma/prisma.service';
import { HistoryQueryDto } from './dto/history-query.dto';
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

  async getHistory(query: HistoryQueryDto) {
    console.log('query', query);
    const tokens = await this.prisma.client.deployedToken.findMany({
      where: { deployerAddress: query.walletAddress },
      orderBy: {
        deployedAt: 'desc',
      },
    });

    return {
      contracts: tokens,
      walletAddress: query.walletAddress,
    };
  }
}
