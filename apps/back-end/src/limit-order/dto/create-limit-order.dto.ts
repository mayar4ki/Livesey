import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { IsFutureTimestamp } from './validators/is-future-timestamp.validator';

export class CreateLimitOrderDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{66}$/, {
    message: 'orderHash must be a valid 0x-prefixed 66-character hex string',
  })
  orderHash: string; // 1inch order hash

  @IsNotEmpty()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'makeToken must be a valid Ethereum address',
  })
  makeToken: string; // Token address being sold

  @IsNotEmpty()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'takeToken must be a valid Ethereum address',
  })
  takeToken: string; // Token address being bought

  @IsNotEmpty()
  @IsString()
  makeAmount: string; // Amount to sell (as string to handle uint256)

  @IsNotEmpty()
  @IsString()
  takeAmount: string; // Amount to buy (as string to handle uint256)

  @IsNotEmpty()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{130}$/, {
    message: 'signature must be a valid 0x-prefixed 132-character hex string',
  })
  signature: string; // EIP712 signature

  @IsNotEmpty()
  @IsString()
  nonce: string; // Order nonce

  @IsNotEmpty()
  @Type(() => Number)
  @Min(0)
  @IsFutureTimestamp()
  expiration: number; // Expiration timestamp (Unix timestamp)

  @IsNotEmpty()
  @Type(() => Number)
  chainId: number; // Chain ID where the order is valid

  @IsOptional()
  @IsString()
  tokenId?: string; // Optional: Token ID from our Token model (for makeToken or takeToken)
}
