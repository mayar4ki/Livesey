import { Module } from '@nestjs/common';

import { BitInvalidatorUpdatedWorkerService } from './bit-invalidator-updated-worker.service.js';

@Module({
  providers: [BitInvalidatorUpdatedWorkerService],
  exports: [BitInvalidatorUpdatedWorkerService],
})
export class BitInvalidatorUpdatedWorkerModule {}
