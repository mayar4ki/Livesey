import { FactoryAbi } from '@acme/smart-contract';
import { WatchContractEventOnLogsParameter } from 'viem';

export type TokenNewOperatorAddressEventsLog = WatchContractEventOnLogsParameter<
  typeof FactoryAbi,
  'TokenNewOperatorAddress'
>[number];
