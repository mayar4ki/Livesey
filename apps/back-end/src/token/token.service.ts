import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { VerifyStatusQueryDto } from './dto/verify-status-query.dto';
import { HistoryQueryDto } from './dto/history-query.dto';
import { createVerificationTask, getVerificationTask } from '@acme/queue';
import { PrismaService } from '../prisma/prisma.service';
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
    const address = await this.prisma.client.address.findUnique({
      where: { walletAddress: query.walletAddress },
      include: {
        verifiedContracts: {
          orderBy: {
            verifiedAt: 'desc',
          },
        },
      },
    });

    return {
      contracts: address?.verifiedContracts ?? [],
      walletAddress: address?.walletAddress ?? query.walletAddress,
    };
  }
}
