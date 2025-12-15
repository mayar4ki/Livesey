import { BigIntToString } from '@acme/shared';
import { FactoryAbi } from '@acme/smart-contract';
import { WatchContractEventOnLogsParameter } from 'viem';

export type OperatorAddedEventsLog = BigIntToString<
  WatchContractEventOnLogsParameter<typeof FactoryAbi, 'OperatorAdded'>[number]
>;
