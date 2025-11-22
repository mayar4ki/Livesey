import { Module } from '@nestjs/common';
import { LimitOrderSignatureGuard } from './guards/limit-order-signature.guard';

import { LimitOrderController } from './limit-order.controller';
import { LimitOrderService } from './limit-order.service';

@Module({
  controllers: [LimitOrderController],
  providers: [LimitOrderService, LimitOrderSignatureGuard],
  exports: [LimitOrderService],
})
export class LimitOrderModule {}
