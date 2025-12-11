import { Transform } from 'class-transformer';
import { OperatorEntity } from '../../operator/entities/operator.entity';

export class TokenSeedDataEntity {
  id: string;
  tokenId: string;
  data: any;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export class TokenEntity {
  id: string;
  token: string;
  chainId: number;
  name: string;
  assetRefHash: string;
  symbol: string;
  totalSupply: string;

  createdBy: string;
  transactionHash: string;

  @Transform(({ value }) => value.toString())
  blockNumber: bigint | string;

  verifiedAt: Date | string | null;
  createdAt: Date | string;

  seedData?: TokenSeedDataEntity | null;
  operator?: OperatorEntity;

  constructor(partial: Partial<TokenEntity>) {
    Object.assign(this, partial);
  }
}
