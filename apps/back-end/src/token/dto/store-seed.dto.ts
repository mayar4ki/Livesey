import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';

class KeyValuePair {
  @IsString()
  key: string;

  @IsString()
  value: string;
}

export class StorePendingSeedDto {
  @IsString()
  assetRefHash: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KeyValuePair)
  seedData: KeyValuePair[];
}
