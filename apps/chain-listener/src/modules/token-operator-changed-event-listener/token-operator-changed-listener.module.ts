import { Module } from '@nestjs/common';

import { TokenOperatorChangedEventListenerService } from './token-operator-changed-event-listener.service.js';

@Module({
  providers: [TokenOperatorChangedEventListenerService],
})
export class TokenOperatorChangedEventListenerModule {}
