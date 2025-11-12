import { Transform } from 'class-transformer';

export class TokenSeedDataEntity {
  id: string;
  deployedTokenId: string;
  seedData: any;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export class TokenEntity {
  id: string;
  contractAddress: string;
  chainId: number;
  name: string;
  assetRefHash: string;
  symbol: string;
  totalSupply: string;
  transactionHash: string;

  @Transform(({ value }) => value.toString())
  blockNumber: bigint | string;

  deployerAddress: string;
  verifiedAt: Date | string | null;
  deployedAt: Date | string;
  seedData?: TokenSeedDataEntity | null;

  constructor(partial: Partial<TokenEntity>) {
    Object.assign(this, partial);
  }
}
