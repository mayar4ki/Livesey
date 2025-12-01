import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { PrismaModule } from "./lib/prisma/prisma.module.js";
import { RedisModule } from "./lib/redis/redis.module.js";
import { ViemModule } from "./lib/viem/viem.module.js";

import { NewAdminAddressEventListnerModule } from "./modules/new-admin-address-event-listner/new-admin-address-event-listner.module.js";
import { NewOperatorAddressEventListnerModule } from "./modules/new-operator-address-event-listner/new-operator-address-event-listner.module.js";
import { NewTokenCreatedEventListnerModule } from "./modules/new-token-created-event-listner/new-token-created-event-listner.module.js";
import { envValidationSchema } from "./schemas/env-validation-schema.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envValidationSchema.parse(config),
    }),
    PrismaModule,
    RedisModule,
    ViemModule,
    NewAdminAddressEventListnerModule,
    NewTokenCreatedEventListnerModule,
    NewOperatorAddressEventListnerModule,
  ],
  providers: [Logger],
})
export class AppModule { }
