import { Address } from "viem";

export enum StoreKeys {
  FACTORY_ADMIN_ADDRESS = "factory:admin:address",
}

export function getOperatorStoreKey(address: string) {
  return `factory:operator:${address.toLowerCase()}`;
}

export function getVerificationTaskKey(chainId: number, token: Address) {
  return `task:${chainId}:${token}`;
}

export function getSeedDataKey(assetRefHash: string) {
  return `seed:${assetRefHash}`;
}
