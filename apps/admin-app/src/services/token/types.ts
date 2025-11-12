export type Token = {
  id: string;
  contractAddress: string;
  chainId: number;
  name: string;
  assetRefHash: string;
  seedData?: Record<string, string>;
  symbol: string;
  totalSupply: string;
  transactionHash: string;
  blockNumber: bigint | string;
  deployerAddress: string;
  verifiedAt: Date | string | null;
  deployedAt: Date | string;
};
