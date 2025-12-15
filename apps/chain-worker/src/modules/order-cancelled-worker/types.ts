import { BigIntToString, ONEINCH_LIMIT_ORDER_PROTOCOL_ABI } from '@acme/shared';
import { WatchContractEventOnLogsParameter } from 'viem';

export type OrderCancelledEventsLog = BigIntToString<
  WatchContractEventOnLogsParameter<typeof ONEINCH_LIMIT_ORDER_PROTOCOL_ABI, 'OrderCancelled'>[number]
>;
