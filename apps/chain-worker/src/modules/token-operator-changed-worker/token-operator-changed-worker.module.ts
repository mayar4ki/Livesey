import { Module } from '@nestjs/common';
import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import { TokenOperatorChangedWorkerService } from './token-operator-changed-worker.service.js';

@Module({
  providers: [TokenOperatorChangedWorkerService, WatermarkService],
  exports: [TokenOperatorChangedWorkerService],
})
export class TokenOperatorChangedWorkerModule {}
