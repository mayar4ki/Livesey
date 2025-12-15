import { BigIntToString, ONEINCH_LIMIT_ORDER_PROTOCOL_ABI } from '@acme/shared';
import { WatchContractEventOnLogsParameter } from 'viem';

export type BitInvalidatorUpdatedEventsLog = BigIntToString<
  WatchContractEventOnLogsParameter<typeof ONEINCH_LIMIT_ORDER_PROTOCOL_ABI, 'BitInvalidatorUpdated'>[number]
>;
