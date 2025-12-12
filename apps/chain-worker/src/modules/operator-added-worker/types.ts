import { FactoryAbi } from '@acme/smart-contract';
import { WatchContractEventOnLogsParameter } from 'viem';

export type OperatorAddedEventsLog = WatchContractEventOnLogsParameter<typeof FactoryAbi, 'OperatorAdded'>[number];
