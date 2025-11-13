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

  // @IsString()
  // @IsNotEmpty()
  // @Matches(/^0x[a-fA-F0-9]{130}$/, {
  //   message: 'Invalid signature format (expected 65-byte signature)',
  // })
  // signature: string;

  // @IsString()
  // @IsNotEmpty()
  // @Matches(/^0x[a-fA-F0-9]{40}$/, {
  //   message: 'Invalid signer address format',
  // })
  // signer: string;
}
