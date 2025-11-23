import { Global, Module } from '@nestjs/common';
import { OneInchService } from './one-inche.service';

@Global()
@Module({
  providers: [OneInchService],
  exports: [OneInchService],
})
export class OneInchModule {}
