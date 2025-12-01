import { WatchContractEventOnLogsParameter } from "viem";
import { FactoryAbi } from "../../../../packages/core-contract";

export type TokenCreatedEvent = WatchContractEventOnLogsParameter<
  typeof FactoryAbi,
  "TokenCreated"
>[number];
