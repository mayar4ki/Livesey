import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { SignatureGuard } from 'src/guards/signature.guard';
import { BaseResponse, BaseResponseDTO } from 'src/lib/base.dto';
import { CreateLimitOrderDto } from './dto/create-limit-order.dto';
import { LimitOrderListQueryDto } from './dto/list-query.dto';
import { LimitOrderEntity } from './entities/limit-order.entity';
import { LimitOrderSignatureGuard } from './guards/limit-order-signature.guard';
import { LimitOrderService } from './limit-order.service';

@Controller('limit-order')
export class LimitOrderController {
  constructor(private readonly limitOrderService: LimitOrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(SignatureGuard, LimitOrderSignatureGuard)
  @SerializeOptions({ type: BaseResponseDTO(LimitOrderEntity) })
  async create(
    @Headers('x-signer') signer: string,
    @Body() dto: CreateLimitOrderDto,
  ): Promise<BaseResponse<LimitOrderEntity>> {
    return this.limitOrderService.create(dto, signer);
  }

  @Get()
  @SerializeOptions({ type: BaseResponseDTO(LimitOrderEntity) })
  async findAll(
    @Query() query: LimitOrderListQueryDto,
  ): Promise<BaseResponse<LimitOrderEntity[]>> {
    return this.limitOrderService.findAll(query);
  }

  @Get('my-orders')
  @UseGuards(SignatureGuard)
  @SerializeOptions({ type: BaseResponseDTO(LimitOrderEntity) })
  async findMyOrders(
    @Headers('x-signer') signer: string,
    @Query() query: LimitOrderListQueryDto,
  ): Promise<BaseResponse<LimitOrderEntity[]>> {
    return this.limitOrderService.findByMaker(signer, query);
  }

  @Get(':orderHash/:chainId')
  @SerializeOptions({ type: BaseResponseDTO(LimitOrderEntity) })
  async findOne(
    @Param('orderHash') orderHash: string,
    @Param('chainId') chainId: number,
  ): Promise<BaseResponse<LimitOrderEntity>> {
    return this.limitOrderService.findOne(orderHash, chainId);
  }

  @Patch(':orderHash/:chainId/cancel')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SignatureGuard)
  async cancelOrder(
    @Headers('x-signer') signer: string,
    @Param('orderHash') orderHash: string,
    @Param('chainId') chainId: number,
  ) {
    return this.limitOrderService.cancelOrder(orderHash, chainId, signer);
  }

  @Patch(':orderHash/:chainId/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('orderHash') orderHash: string,
    @Param('chainId') chainId: number,
    @Body() body: { status: 'pending' | 'filled' | 'cancelled' | 'expired' },
  ) {
    return this.limitOrderService.updateStatus(orderHash, chainId, body.status);
  }
}
