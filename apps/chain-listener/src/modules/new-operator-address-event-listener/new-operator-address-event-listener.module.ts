import { Module } from '@nestjs/common';

import { NewOperatorAddressEventListenerService } from './new-operator-address-event-listener.service.js';

@Module({
  providers: [NewOperatorAddressEventListenerService],
})
export class NewOperatorAddressEventListenerModule {}
