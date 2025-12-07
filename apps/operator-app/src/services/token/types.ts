export type Token = {
  id: string;
  token: string;
  chainId: number;
  name: string;
  assetRefHash: string;
  seedData?: TokenSeedData;
  symbol: string;
  totalSupply: string;
  operator: string;
  createdBy: string;
  transactionHash: string;
  blockNumber: bigint | string;
  verifiedAt: Date | string | null;
  createdAt: Date | string;
};

export interface TokenSeedData {
  id: string;
  data: { key: string; value: string }[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
