import { Transform } from 'class-transformer';

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

  chainId: number;
  status: string;
  tokenId?: string | null;

  createdAt: Date | string;
  updatedAt: Date | string;

  constructor(partial: Partial<LimitOrderEntity>) {
    Object.assign(this, partial);
  }
}
