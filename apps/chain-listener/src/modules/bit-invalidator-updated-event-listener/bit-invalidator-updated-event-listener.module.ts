import { Module } from '@nestjs/common';

import { BitInvalidatorUpdatedEventListenerService } from './bit-invalidator-updated-event-listener.service.js';

@Module({
  providers: [BitInvalidatorUpdatedEventListenerService],
})
export class BitInvalidatorUpdatedEventListenerModule {}
