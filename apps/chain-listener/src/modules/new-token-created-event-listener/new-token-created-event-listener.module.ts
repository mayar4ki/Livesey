import { Module } from '@nestjs/common';
import { NewTokenCreatedEventListenerService } from './new-token-created-event-listener.service';
import { QueueVerificationTaskService } from './queue-verification-task.service';
import { StoreDeployedTokenService } from './store-deployed-token.service';

@Module({
  providers: [NewTokenCreatedEventListenerService, StoreDeployedTokenService, QueueVerificationTaskService],
  exports: [NewTokenCreatedEventListenerService, StoreDeployedTokenService, QueueVerificationTaskService],
})
export class NewTokenCreatedEventListenerModule {}
