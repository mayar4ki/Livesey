/**
 * Recursively converts all BigInt values to strings in an object.
 * This is useful for JSON serialization since JSON.stringify cannot handle BigInt.
 */
export function serializeBigInt<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString() as unknown as T;
  }

  if (Array.isArray(value)) {
    return value.map(serializeBigInt) as unknown as T;
  }

  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      result[key] = serializeBigInt((value as Record<string, unknown>)[key]);
    }
    return result as T;
  }

  return value;
}

