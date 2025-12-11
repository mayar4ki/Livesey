import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateOperatorNameDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
