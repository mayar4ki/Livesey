import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateVoteDto {
  @IsNotEmpty()
  @IsString()
  proposalId: string;

  @IsNotEmpty()
  @IsBoolean()
  choice: boolean; // true = yes/for, false = no/against
}
