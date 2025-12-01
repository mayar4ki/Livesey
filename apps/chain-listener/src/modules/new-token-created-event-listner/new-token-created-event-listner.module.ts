import { Module } from "@nestjs/common";
import { NewTokenCreatedEventListnerService } from "./new-token-created-event-listner.service";

@Module({
  providers: [NewTokenCreatedEventListnerService],
})
export class NewTokenCreatedEventListnerModule { }