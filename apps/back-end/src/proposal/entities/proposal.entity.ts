import { Transform, Type } from 'class-transformer';

export class VoteEntity {
  id: string;
  proposalId: string;
  createdBy: string;

  @Transform(({ value }) => value.toString())
  votingPower: bigint | string;

  choice: boolean;

  createdAt: Date | string;

  constructor(partial: Partial<VoteEntity>) {
    Object.assign(this, partial);
  }
}

export class ProposalEntity {
  id: string;
  title: string;
  description: string;
  duration: number;
  createdBy: string;

  @Transform(({ value }) => value.toString())
  blockNumber: bigint | string;

  createdAt: Date | string;
  expiresAt: Date | string;
  tokenId: string;

  @Type(() => VoteEntity)
  votes?: VoteEntity[];

  constructor(partial: Partial<ProposalEntity>) {
    Object.assign(this, partial);
  }
}
