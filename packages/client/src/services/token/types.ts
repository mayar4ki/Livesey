import { Address } from "viem";
import { Operator } from "../operator/types";

export interface Token {
  id: string;
  token: Address;
  chainId: number;
  name: string;
  assetRefHash: string;
  seedData?: TokenSeedData | null;
  symbol: string;
  totalSupply: string;
  operator?: Operator;
  transactionHash: string;
  blockNumber: bigint | string;
  createdBy: string;
  verifiedAt: Date | string | null;
  createdAt: Date | string;
}

export interface TokenSeedData {
  id: string;
  data: { key: string; value: string }[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
