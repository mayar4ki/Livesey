import { LimitOrderType } from '@acme/db';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum LimitOrderStatus {
  PENDING = 'pending',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum LimitOrderSortBy {
  TYPE = 'type',
  OFFER = 'makeAmount',
  ASK = 'takeAmount',
  PRICE = 'makeAmount', // Price is calculated, so we'll sort by makeAmount as proxy
  STATUS = 'status',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
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
  @IsEnum(LimitOrderType)
  type?: LimitOrderType; // Filter by order type (BUY or SELL)

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

  @IsOptional()
  @IsString()
  search?: string; // Search by orderHash, maker, makeToken, or takeToken

  @IsOptional()
  @IsEnum(LimitOrderSortBy)
  sortBy?: LimitOrderSortBy;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}
