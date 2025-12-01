import { FactoryAbi } from "@acme/smart-contract";
import { WatchContractEventOnLogsParameter } from "viem";

export type TokenCreatedEvent = WatchContractEventOnLogsParameter<
  typeof FactoryAbi,
  "TokenCreated"
>[number];
