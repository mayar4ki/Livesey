import { IsString, IsNumber, IsArray, Min, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { type Address } from 'viem';

export class VerifyTokenDto {
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Invalid Ethereum contract address format',
  })
  contractAddress: Address;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  chainId: number;

  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Invalid Ethereum wallet address format',
  })
  walletAddress: Address;

  @IsArray()
  @IsString({ each: true })
  @Matches(/^[^?%\/\\]*$/, {
    each: true,
    message: 'Args cannot contain characters ?, %, /, or \\',
  })
  args: string[];
}

