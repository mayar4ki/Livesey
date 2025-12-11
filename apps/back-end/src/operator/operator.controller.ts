import { Controller, Get, Query, SerializeOptions } from '@nestjs/common';
import { BaseResponse, BaseResponseDTO } from '../lib/base.dto';
import { OperatorListQueryDto } from './dto/list-query.dto';
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
}
