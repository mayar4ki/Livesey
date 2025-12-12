export type Watermark = {
  block: bigint;
  logIndex?: number;
  txHash?: string;
};

export type WatermarkKeyParams = {
  chainId: string | number;
  address: string;
  eventName: string;
};

export type SerializedWatermark = {
  block: string;
  logIndex?: number;
  txHash?: string;
  updatedAt?: string;
};

export function makeWatermarkKey(params: WatermarkKeyParams): string {
  return `chain-listener:watermark:${params.chainId}:${params.address}:${params.eventName}`;
}

export function serializeWatermark(watermark: Watermark): SerializedWatermark {
  return {
    block: watermark.block.toString(),
    logIndex: watermark.logIndex,
    txHash: watermark.txHash,
    updatedAt: new Date().toISOString(),
  };
}

export function deserializeWatermark(value: SerializedWatermark | null): Watermark | null {
  if (!value) return null;

  return {
    block: BigInt(value.block),
    logIndex: value.logIndex,
    txHash: value.txHash,
  };
}

export function isNewerWatermark(current: Watermark | null, next: Watermark): boolean {
  if (!current) return true;

  if (next.block > current.block) return true;
  if (next.block < current.block) return false;

  const currentLogIndex = current.logIndex ?? -1;
  const nextLogIndex = next.logIndex ?? -1;

  return nextLogIndex > currentLogIndex;
}
