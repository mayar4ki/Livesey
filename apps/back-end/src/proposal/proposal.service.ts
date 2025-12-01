import { ERC20ImplementationAbi } from '@acme/smart-contract';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Address } from 'viem';
import { BaseResponse } from '../lib/base.dto';
import { PrismaService } from '../lib/prisma/prisma.service';
import { ViemPublicClientService } from '../lib/viem/viem.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { CreateVoteDto } from './dto/create-vote.dto';
import { ProposalListQueryDto } from './dto/list-query.dto';
import { ProposalEntity } from './entities/proposal.entity';

@Injectable()
export class ProposalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly viemPublicClient: ViemPublicClientService,
  ) {}

  private readonly REQUIRED_VOTING_POWER_PERCENTAGE = 20;

  async create(dto: CreateProposalDto, creatorAddress: string) {
    const blockNumber = await this.viemPublicClient.client.getBlockNumber();

    const token = await this.prisma.client.token.findUnique({
      where: {
        id: dto.tokenId,
      },
    });

    if (!token) {
      throw new NotFoundException('Token not found');
    }

    // Get creator's voting power
    const votingPower = await this.calculateVotingPower(
      token.token,
      creatorAddress as Address,
      BigInt(blockNumber),
    );

    if (votingPower === 0n) {
      throw new BadRequestException(
        'You must hold tokens to create a proposal',
      );
    }

    // Get total supply from blockchain
    const totalSupply = await this.viemPublicClient.client.readContract({
      address: token.token as Address,
      abi: ERC20ImplementationAbi,
      functionName: 'totalSupply',
      blockNumber: BigInt(blockNumber),
    });

    // Creator must hold at least 20% of total voting power
    const requiredVotingPower =
      (BigInt(totalSupply) * BigInt(this.REQUIRED_VOTING_POWER_PERCENTAGE)) /
      BigInt(100);

    if (votingPower < requiredVotingPower) {
      throw new BadRequestException(
        `You must hold at least 20% of total voting power (${requiredVotingPower.toString()} tokens) to create a proposal`,
      );
    }

    await this.prisma.client.proposal.create({
      data: {
        title: dto.title,
        description: dto.description,
        duration: dto.duration,
        blockNumber: BigInt(blockNumber),
        expiresAt: new Date(Date.now() + dto.duration * 1000),
        tokenId: token.id,
        createdBy: creatorAddress,
      },
    });

    return {};
  }

  async findByDeployedToken(
    tokenId: string,
    query: ProposalListQueryDto,
  ): Promise<BaseResponse<ProposalEntity[]>> {
    const { skip = 0, take = 10 } = query;

    const where = {
      tokenId,
    };

    const [proposals, total] = await Promise.all([
      this.prisma.client.proposal.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.client.proposal.count({
        where,
      }),
    ]);

    return {
      data: proposals,
      pagination: {
        skip,
        take,
        total,
      },
    };
  }

  async findOne(id: string): Promise<BaseResponse<ProposalEntity>> {
    const proposal = await this.prisma.client.proposal.findUnique({
      where: { id },
      include: {
        votes: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    return {
      data: proposal,
    };
  }

  async createVote(dto: CreateVoteDto, voterAddress: string) {
    // Check if proposal exists and get token information
    const proposal = await this.prisma.client.proposal.findUnique({
      where: { id: dto.proposalId },
      include: {
        token: {
          select: {
            token: true,
            chainId: true,
          },
        },
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    // Check if proposal is still active (not expired)
    const now = new Date();
    if (proposal.expiresAt < now) {
      throw new BadRequestException(
        'Proposal has expired and voting is closed',
      );
    }

    // Check if user has already voted (prevent double voting)
    const existingVote = await this.prisma.client.vote.findUnique({
      where: {
        proposalId_createdBy: {
          proposalId: dto.proposalId,
          createdBy: voterAddress,
        },
      },
    });

    if (existingVote) {
      throw new ConflictException('You have already voted on this proposal');
    }

    // Calculate voting power by reading token balance from blockchain at proposal's block number
    const votingPower = await this.calculateVotingPower(
      proposal.token.token,
      voterAddress as Address,
      proposal.blockNumber,
    );

    if (votingPower === 0n) {
      throw new BadRequestException(
        'You must hold tokens to vote on this proposal',
      );
    }

    await this.prisma.client.vote.create({
      data: {
        proposalId: dto.proposalId,
        createdBy: voterAddress,
        votingPower,
        choice: dto.choice,
      },
    });

    return {};
  }

  private async calculateVotingPower(
    contractAddress: string,
    voterAddress: Address,
    blockNumber: bigint,
  ): Promise<bigint> {
    try {
      // Read balanceOf from the ERC20 contract at the specific block number
      const balance = await this.viemPublicClient.client.readContract({
        address: contractAddress as Address,
        abi: ERC20ImplementationAbi,
        functionName: 'balanceOf',
        args: [voterAddress],
        blockNumber,
      });

      // balanceOf returns bigint for ERC20 tokens
      if (typeof balance === 'bigint') {
        return balance;
      }
      // Fallback for other types (shouldn't happen with ERC20)
      return BigInt(String(balance));
    } catch (error) {
      throw new BadRequestException(
        'Failed to calculate voting power. Please ensure you held tokens when the proposal was created.',
      );
    }
  }
}
