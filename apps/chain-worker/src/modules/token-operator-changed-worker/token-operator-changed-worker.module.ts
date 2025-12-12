import { Module } from '@nestjs/common';

import { TokenOperatorChangedWorkerService } from './token-operator-changed-worker.service.js';

@Module({
  providers: [TokenOperatorChangedWorkerService],
  exports: [TokenOperatorChangedWorkerService],
})
export class TokenOperatorChangedWorkerModule {}
