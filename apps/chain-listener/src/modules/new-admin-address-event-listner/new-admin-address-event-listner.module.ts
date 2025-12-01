import { Module } from "@nestjs/common";

import { NewAdminAddressEventListnerService } from "./new-admin-address-event-listner.service.js";

@Module({
  providers: [NewAdminAddressEventListnerService],
})
export class NewAdminAddressEventListnerModule { }
