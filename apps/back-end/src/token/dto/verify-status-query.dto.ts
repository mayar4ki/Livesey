import { IsString, IsNumber, IsNotEmpty, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { type Address } from 'viem';

export class VerifyStatusQueryDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Invalid contract address format',
  })
  contractAddress: Address;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  chainId: number;
}
