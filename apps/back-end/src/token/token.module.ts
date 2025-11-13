import { Module } from '@nestjs/common';
import { SignatureVerificationGuard } from './guards/signature-verification.guard';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';

@Module({
  controllers: [TokenController],
  providers: [TokenService, SignatureVerificationGuard],
})
export class TokenModule {}
