import { BigIntToString } from '@acme/shared';
import { FactoryAbi } from '@acme/smart-contract';
import { WatchContractEventOnLogsParameter } from 'viem';

export type OperatorUnpausedEventsLog = BigIntToString<
  WatchContractEventOnLogsParameter<typeof FactoryAbi, 'OperatorUnpaused'>[number]
>;
