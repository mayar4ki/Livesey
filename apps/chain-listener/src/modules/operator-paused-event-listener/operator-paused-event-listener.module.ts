import { Module } from '@nestjs/common';
import { OperatorPausedEventListenerService } from './operator-paused-event-listener.service';

@Module({
  providers: [OperatorPausedEventListenerService],
})
export class OperatorPausedEventListenerModule {}
