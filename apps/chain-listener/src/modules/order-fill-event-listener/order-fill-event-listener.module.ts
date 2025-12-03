import { Module } from '@nestjs/common';

import { OrderFillEventListenerService } from './order-fill-event-listener.service.js';

@Module({
  providers: [OrderFillEventListenerService],
})
export class OrderFilledEventListenerModule {}
