import { Module } from '@nestjs/common';
import { OperatorAddedWorkerService } from './operator-added-worker.service.js';

@Module({
  providers: [OperatorAddedWorkerService],
  exports: [OperatorAddedWorkerService],
})
export class OperatorAddedWorkerModule {}
