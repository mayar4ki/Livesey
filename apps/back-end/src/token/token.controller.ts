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
} from '@nestjs/common';
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

  @Get(':id')
  @SerializeOptions({ type: BaseResponseDTO(TokenEntity) })
  async findOne(@Param('id') id: string): Promise<BaseResponse<TokenEntity>> {
    return this.tokenService.findOne(id);
  }

  @Post('pending-seed')
  @HttpCode(HttpStatus.OK)
  async storePendingSeed(@Body() dto: StorePendingSeedDto) {
    return this.tokenService.storePendingSeed(dto);
  }
}
