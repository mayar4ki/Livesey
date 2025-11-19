import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsString, Min } from 'class-validator';

export class CreateProposalDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Min(1)
  duration: number; // Duration in seconds

  @IsNotEmpty()
  @IsString()
  tokenId: string;
}
