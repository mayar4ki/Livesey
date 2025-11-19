import { Address } from "viem";

export enum StoreKeys {
  FACTORY_ADMIN_ADDRESS = "factory:admin:address",
  ADMIN_NONCE_PREFIX = "admin:nonce",
}

export function getVerificationTaskKey(chainId: number, token: Address) {
  return `task:${chainId}:${token}`;
}

export function getSeedDataKey(assetRefHash: string) {
  return `seed:${assetRefHash}`;
}
