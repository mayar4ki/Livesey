import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { ViemPublicClientService } from "./viem.service.js";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [ViemPublicClientService],
  exports: [ViemPublicClientService],
})
export class ViemModule {}
