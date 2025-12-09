import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { OperatorSignatureGuard } from 'src/guards/operator-signature.guard';
import { SignatureGuard } from 'src/guards/signature.guard';
import { BaseResponse, BaseResponseDTO } from 'src/lib/base.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { CreateVoteDto } from './dto/create-vote.dto';
import { ProposalListQueryDto } from './dto/list-query.dto';
import { ProposalEntity } from './entities/proposal.entity';
import { VotePowerGuard } from './guards/vote-power.guard';
import { ProposalService } from './proposal.service';

@Controller('proposal')
export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}

  @Post('with-voting-power')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(SignatureGuard, VotePowerGuard)
  async createWithVotingPower(
    @Headers('x-signer') signer: string,
    @Body() dto: CreateProposalDto,
  ) {
    return this.proposalService.create(dto, signer);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(OperatorSignatureGuard)
  async create(
    @Headers('x-signer') signer: string,
    @Body() dto: CreateProposalDto,
  ) {
    return this.proposalService.create(dto, signer);
  }

  @Get('token/:tokenId')
  @SerializeOptions({ type: BaseResponseDTO(ProposalEntity) })
  async findByDeployedToken(
    @Param('tokenId') tokenId: string,
    @Query() query: ProposalListQueryDto,
  ): Promise<BaseResponse<ProposalEntity[]>> {
    return this.proposalService.findByDeployedToken(tokenId, query);
  }

  @Get(':id')
  @SerializeOptions({ type: BaseResponseDTO(ProposalEntity) })
  async findOne(
    @Param('id') id: string,
  ): Promise<BaseResponse<ProposalEntity>> {
    return this.proposalService.findOne(id);
  }

  @Post('vote')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(SignatureGuard)
  async createVote(
    @Headers('x-signer') signer: string,
    @Body() dto: CreateVoteDto,
  ) {
    return this.proposalService.createVote(dto, signer);
  }
}
