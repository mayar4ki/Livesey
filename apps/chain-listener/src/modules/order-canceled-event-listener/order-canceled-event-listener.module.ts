import { Module } from '@nestjs/common';

import { OrderCanceledEventListenerService } from './order-canceled-event-listener.service.js';

@Module({
  providers: [OrderCanceledEventListenerService],
})
export class OrderCanceledEventListenerModule {}
