import { Module } from '@nestjs/common';

import { BitInvalidatorUpdatedEventLListenerService } from './bit-invalidator-updated-event-listener.service.js';

@Module({
  providers: [BitInvalidatorUpdatedEventLListenerService],
})
export class BitInvalidatorUpdatedEventLListenerModule {}
