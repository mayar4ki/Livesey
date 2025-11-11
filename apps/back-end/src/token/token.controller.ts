import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListQueryDto } from './dto/list-query.dto';
import { TokenEntity } from './entities/token.entity';
import { TokenService } from './token.service';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('list')
  async list(@Query() query: ListQueryDto) {
    return this.tokenService.list(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TokenEntity> {
    return this.tokenService.findOne(id);
  }
}
