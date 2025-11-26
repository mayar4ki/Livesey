import { Transform, Type } from 'class-transformer';
import { TokenEntity } from '../../token/entities/token.entity';

export class LimitOrderEntity {
  id: string;
  orderHash: string;
  maker: string;
  makeToken: string;
  takeToken: string;
  makeAmount: string;
  takeAmount: string;
  signature: string;

  @Transform(({ value }) => value.toString())
  nonce: bigint | string;

  @Transform(({ value }) => value.toString())
  expiration: bigint | string;

  salt: string;

  chainId: number;
  status: string;
  tokenId?: string | null;

  @Type(() => TokenEntity)
  token?: TokenEntity | null;

  createdAt: Date | string;
  updatedAt: Date | string;

  constructor(partial: Partial<LimitOrderEntity>) {
    Object.assign(this, partial);
  }
}
