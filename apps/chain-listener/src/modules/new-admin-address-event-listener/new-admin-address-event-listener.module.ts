import { Module } from '@nestjs/common';

import { NewAdminAddressEventListenerService } from './new-admin-address-event-listener.service.js';

@Module({
  providers: [NewAdminAddressEventListenerService],
})
export class NewAdminAddressEventListenerModule {}
