import { FactoryAbi } from '@acme/smart-contract';
import { WatchContractEventOnLogsParameter } from 'viem';

export type OperatorPausedEventsLog = WatchContractEventOnLogsParameter<typeof FactoryAbi, 'OperatorPaused'>[number];
