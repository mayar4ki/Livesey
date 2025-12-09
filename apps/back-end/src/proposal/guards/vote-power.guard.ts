import { ERC20ImplementationAbi } from '@acme/smart-contract';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Address } from 'viem';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { ViemPublicClientService } from '../../lib/viem/viem.service';

@Injectable()
export class VotePowerGuard implements CanActivate {
  private readonly REQUIRED_VOTING_POWER_PERCENTAGE = 20;

  constructor(
    private readonly prisma: PrismaService,
    private readonly viemPublicClient: ViemPublicClientService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const signer = req.headers['x-signer'];
    const { tokenId } = req.body;

    if (!signer) {
      throw new BadRequestException('Missing x-signer header');
    }

    const blockNumber = await this.viemPublicClient.client.getBlockNumber();

    const token = await this.prisma.client.token.findUnique({
      where: { id: tokenId },
    });

    if (!token) {
      throw new NotFoundException('Token not found');
    }

    // Get creator's voting power
    const votingPower = await this.calculateVotingPower(
      token.token,
      signer as Address,
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

    const requiredVotingPower =
      (BigInt(totalSupply) * BigInt(this.REQUIRED_VOTING_POWER_PERCENTAGE)) /
      BigInt(100);

    if (votingPower < requiredVotingPower) {
      throw new BadRequestException(
        `You must hold at least 20% of total voting power (${requiredVotingPower.toString()} tokens) to create a proposal`,
      );
    }

    return true;
  }

  private async calculateVotingPower(
    contractAddress: string,
    voterAddress: Address,
    blockNumber: bigint,
  ): Promise<bigint> {
    try {
      const balance = await this.viemPublicClient.client.readContract({
        address: contractAddress as Address,
        abi: ERC20ImplementationAbi,
        functionName: 'balanceOf',
        args: [voterAddress],
        blockNumber,
      });

      return typeof balance === 'bigint' ? balance : BigInt(String(balance));
    } catch {
      throw new BadRequestException(
        'Failed to calculate voting power. Please ensure you held tokens when the proposal was created.',
      );
    }
  }
}
