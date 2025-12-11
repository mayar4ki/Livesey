import { Module } from '@nestjs/common';
import { OperatorPausedEventListenerService } from './operator-paused-event-listener.service';
import { OperatorUnpausedEventListenerService } from './operator-unpaused-event-listener.service';

@Module({
  providers: [OperatorPausedEventListenerService, OperatorUnpausedEventListenerService],
})
export class OperatorPausedUnpausedEventListenerModule {}
