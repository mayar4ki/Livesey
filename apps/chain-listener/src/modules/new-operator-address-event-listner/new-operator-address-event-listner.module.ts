import { Module } from "@nestjs/common";

import { NewOperatorAddressEventListnerService } from "./new-operator-address-event-listner.service.js";

@Module({
  providers: [NewOperatorAddressEventListnerService],
})
export class NewOperatorAddressEventListnerModule { }
