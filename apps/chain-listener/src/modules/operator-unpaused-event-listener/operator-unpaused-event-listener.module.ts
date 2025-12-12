import { Module } from '@nestjs/common';
import { OperatorUnpausedEventListenerService } from './operator-unpaused-event-listener.service';

@Module({
  providers: [OperatorUnpausedEventListenerService],
})
export class OperatorUnpausedEventListenerModule {}
