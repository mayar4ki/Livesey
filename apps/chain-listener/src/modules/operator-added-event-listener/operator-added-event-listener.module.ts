import { Module } from '@nestjs/common';

import { OperatorAddedEventListenerService } from './operator-added-event-listener.service.js';

@Module({
  providers: [OperatorAddedEventListenerService],
})
export class OperatorAddedEventListenerModule {}
