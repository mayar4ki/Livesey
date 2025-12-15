import { BigIntToString } from '@acme/shared';
import { FactoryAbi } from '@acme/smart-contract';
import { WatchContractEventOnLogsParameter } from 'viem';

export type TokenNewOperatorAddressEventsLog = BigIntToString<
  WatchContractEventOnLogsParameter<typeof FactoryAbi, 'TokenNewOperatorAddress'>[number]
>;
