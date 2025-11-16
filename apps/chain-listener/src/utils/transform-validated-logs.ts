import { QueueVerificationTaskData } from "../helpers/queue-verification-tasks.js";
import { StoreDeployedTokenData } from "../helpers/store-deployed-tokens.js";
import { ValidatedLog } from "../schemas/event-args-validation-schema.js";

/**
 * Transform validated logs to StoreDeployedTokenData format
 * Includes snapshot space data from the API response
 */
export function transformToStoreDeployedTokenData(
  validLogs: ValidatedLog[],
  chainId: number
): StoreDeployedTokenData[] {
  return validLogs.map(({ log, args }) => ({
    contractAddress: args.createdBeaconProxy,
    chainId,
    deployerAddress: args.deployer,
    name: args.name,
    symbol: args.symbol,
    assetRefHash: args.assetRefHash,
    totalSupply: args.totalSupply.toString(),
    transactionHash: log.transactionHash,
    blockNumber: log.blockNumber,
  }));
}

/**
 * Transform validated logs to QueueVerificationTaskData format
 */
export function transformToQueueVerificationTaskData(
  validLogs: ValidatedLog[],
  chainId: number
): QueueVerificationTaskData[] {
  return validLogs.map(({ args }) => ({
    contractAddress: args.createdBeaconProxy,
    chainId,
    deployerAddress: args.deployer,
    name: args.name,
    symbol: args.symbol,
    totalSupply: args.totalSupply,
  }));
}
