import { BigIntToString } from '@acme/shared';
import { FactoryAbi } from '@acme/smart-contract';
import { WatchContractEventOnLogsParameter } from 'viem';

export type TokenCreatedEventsLog = BigIntToString<
  WatchContractEventOnLogsParameter<typeof FactoryAbi, 'TokenCreated'>[number]
>;
