import { Module } from '@nestjs/common';
import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import { BitInvalidatorUpdatedWorkerService } from './bit-invalidator-updated-worker.service.js';

@Module({
  providers: [BitInvalidatorUpdatedWorkerService, WatermarkService],
  exports: [BitInvalidatorUpdatedWorkerService],
})
export class BitInvalidatorUpdatedWorkerModule {}
