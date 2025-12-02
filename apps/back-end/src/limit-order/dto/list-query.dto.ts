import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum LimitOrderStatus {
  PENDING = 'pending',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export class LimitOrderListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number = 10;

  @IsOptional()
  @IsEnum(LimitOrderStatus)
  status?: LimitOrderStatus;

  @IsOptional()
  @IsString()
  makeToken?: string; // Filter by make token address

  @IsOptional()
  @IsString()
  takeToken?: string; // Filter by take token address

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  chainId?: number; // Filter by chain ID

  @IsOptional()
  @IsString()
  maker?: string; // Filter by maker address
}
