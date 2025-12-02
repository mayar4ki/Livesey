import { Module } from "@nestjs/common";
import { NewTokenCreatedEventListnerService } from "./new-token-created-event-listner.service";
import { QueueVerificationTaskService } from "./queue-verification-task.service";
import { StoreDepolyedTokenService } from "./store-deployed-token.service";

@Module({
  providers: [NewTokenCreatedEventListnerService, StoreDepolyedTokenService, QueueVerificationTaskService],
  exports: [NewTokenCreatedEventListnerService, StoreDepolyedTokenService, QueueVerificationTaskService],
})
export class NewTokenCreatedEventListnerModule { }