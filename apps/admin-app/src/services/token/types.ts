export type Token = {
  id: string;
  token: string;
  chainId: number;
  name: string;
  assetRefHash: string;
  seedData?: Record<string, string>;
  symbol: string;
  totalSupply: string;
  operator: string;
  createdBy: string;
  transactionHash: string;
  blockNumber: bigint | string;
  verifiedAt: Date | string | null;
  createdAt: Date | string;
};
