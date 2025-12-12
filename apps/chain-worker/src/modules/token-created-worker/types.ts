import { FactoryAbi } from '@acme/smart-contract';
import { WatchContractEventOnLogsParameter } from 'viem';

export type TokenCreatedEventsLog = WatchContractEventOnLogsParameter<typeof FactoryAbi, 'TokenCreated'>[number];
