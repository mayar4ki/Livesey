import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TokenService } from './token.service';
import { VerifyStatusQueryDto } from './dto/verify-status-query.dto';
import { HistoryQueryDto } from './dto/history-query.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('verify')
  @HttpCode(HttpStatus.ACCEPTED)
  async verify(@Body() verifyTokenDto: VerifyTokenDto) {
    return this.tokenService.verify(verifyTokenDto);
  }

  @Get('verify/status')
  async verifyStatus(@Query() query: VerifyStatusQueryDto) {
    return this.tokenService.verifyStatus(query);
  }

  @Get('history')
  async getHistory(@Query() query: HistoryQueryDto) {
    return this.tokenService.getHistory(query);
  }
}
