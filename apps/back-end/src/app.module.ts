import { Module } from '@nestjs/common';
import { TokenModule } from './token/token.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, TokenModule, HealthModule],
})
export class AppModule {}
