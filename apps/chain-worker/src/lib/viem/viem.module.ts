import { Global, Module } from "@nestjs/common";

import { ViemPublicClientService } from "./viem.service.js";

@Global()
@Module({
  providers: [ViemPublicClientService],
  exports: [ViemPublicClientService],
})
export class ViemModule { }
