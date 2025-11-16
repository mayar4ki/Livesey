import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { AdminSignatureGuard } from 'src/guards/admin-signature.guard';
import { BaseResponse, BaseResponseDTO } from 'src/lib/base.dto';
import { ListQueryDto } from './dto/list-query.dto';
import { StorePendingSeedDto } from './dto/store-seed.dto';
import { TokenEntity } from './entities/token.entity';
import { TokenService } from './token.service';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('list')
  @SerializeOptions({ type: BaseResponseDTO(TokenEntity) })
  async list(
    @Query() query: ListQueryDto,
  ): Promise<BaseResponse<TokenEntity[]>> {
    return this.tokenService.list(query);
  }

  @Get('chain/:chainId/address/:address')
  @SerializeOptions({ type: BaseResponseDTO(TokenEntity) })
  async findOneByAddress(
    @Param('address') address: string,
    @Param('chainId') chainId: number,
  ): Promise<BaseResponse<TokenEntity>> {
    return this.tokenService.findOneByAddress(address, chainId);
  }

  @Get(':id')
  @SerializeOptions({ type: BaseResponseDTO(TokenEntity) })
  async findOne(@Param('id') id: string): Promise<BaseResponse<TokenEntity>> {
    return this.tokenService.findOne(id);
  }

  @Post('pending-seed')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminSignatureGuard)
  async storePendingSeed(@Body() dto: StorePendingSeedDto) {
    return this.tokenService.storePendingSeed(dto);
  }
}
