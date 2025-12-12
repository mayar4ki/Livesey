import { Module } from '@nestjs/common';

import { NewAdminAddressWatcherService } from './new-admin-address-watcher.service.js';

@Module({
  providers: [NewAdminAddressWatcherService],
})
export class NewAdminAddressEventListenerModule {}
