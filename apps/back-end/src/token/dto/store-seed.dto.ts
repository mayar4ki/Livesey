import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

class KeyValuePair {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class StorePendingSeedDto {
  @IsString()
  @IsNotEmpty()
  assetRefHash: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KeyValuePair)
  seedData: KeyValuePair[];
}
