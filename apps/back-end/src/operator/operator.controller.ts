import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { AdminSignatureGuard } from 'src/guards/admin-signature.guard';
import { BaseResponse, BaseResponseDTO } from '../lib/base.dto';
import { OperatorListQueryDto } from './dto/list-query.dto';
import { UpdateOperatorNameDto } from './dto/update-operator-name.dto';
import { OperatorEntity } from './entities/operator.entity';
import { OperatorService } from './operator.service';

@Controller('operator')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @Get('list')
  @SerializeOptions({ type: BaseResponseDTO(OperatorEntity) })
  async list(
    @Query() query: OperatorListQueryDto,
  ): Promise<BaseResponse<OperatorEntity[]>> {
    return this.operatorService.list(query);
  }

  @Patch(':address/:chainId/name')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminSignatureGuard)
  async updateName(
    @Param('address') address: string,
    @Param('chainId', ParseIntPipe) chainId: number,
    @Body() dto: UpdateOperatorNameDto,
  ) {
    return this.operatorService.updateName(address, chainId, dto);
  }
}
