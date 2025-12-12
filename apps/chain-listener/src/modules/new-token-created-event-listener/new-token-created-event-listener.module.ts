import { Module } from '@nestjs/common';
import { NewTokenCreatedEventListenerService } from './new-token-created-event-listener.service';

@Module({
  providers: [NewTokenCreatedEventListenerService],
})
export class NewTokenCreatedEventListenerModule {}
