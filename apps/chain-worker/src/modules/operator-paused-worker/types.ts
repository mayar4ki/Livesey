import { BigIntToString } from '@acme/shared';
import { FactoryAbi } from '@acme/smart-contract';
import { WatchContractEventOnLogsParameter } from 'viem';

export type OperatorPausedEventsLog = BigIntToString<
  WatchContractEventOnLogsParameter<typeof FactoryAbi, 'OperatorPaused'>[number]
>;
