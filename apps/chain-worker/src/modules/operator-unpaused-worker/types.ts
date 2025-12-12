import { FactoryAbi } from '@acme/smart-contract';
import { WatchContractEventOnLogsParameter } from 'viem';

export type OperatorUnpausedEventsLog = WatchContractEventOnLogsParameter<typeof FactoryAbi, 'OperatorUnpaused'>[number];
