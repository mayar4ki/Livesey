import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { type Address } from 'viem';

export class HistoryQueryDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Invalid wallet address format',
  })
  walletAddress: Address;
}

