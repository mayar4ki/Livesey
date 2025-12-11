export class OperatorEntity {
  id: string;
  address: string;
  chainId: number;
  name: string;
  isPaused: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;

  constructor(partial: Partial<OperatorEntity>) {
    Object.assign(this, partial);
  }
}
