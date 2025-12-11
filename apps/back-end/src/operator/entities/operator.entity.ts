export class OperatorEntity {
  id: string;
  address: string;
  chainId: number;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;

  constructor(partial: Partial<OperatorEntity>) {
    Object.assign(this, partial);
  }
}
