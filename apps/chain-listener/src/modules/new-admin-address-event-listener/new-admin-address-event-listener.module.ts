import { Module } from '@nestjs/common';

import { WatermarkService } from '../../lib/watermark/watermark.service.js';
import { NewAdminAddressBackfillService } from './new-admin-address-backfill.service.js';
import { NewAdminAddressListenerInitService } from './new-admin-address-listener-init.service.js';
import { NewAdminAddressEventListenerService } from './new-admin-address-event-listener.service.js';
import { NewAdminAddressWatcherService } from './new-admin-address-watcher.service.js';

@Module({
  providers: [
    NewAdminAddressListenerInitService,
    WatermarkService,
    NewAdminAddressWatcherService,
    NewAdminAddressBackfillService,
    NewAdminAddressEventListenerService,
  ],
})
export class NewAdminAddressEventListenerModule {}
