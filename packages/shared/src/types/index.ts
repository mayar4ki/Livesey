/**
 * Recursively replaces all `bigint` types with `string` in a given type.
 * Useful for JSON serialization or API types where bigint values are represented as strings.
 *
 * @example
 * ```ts
 * type WithBigInt = { id: bigint; amount: bigint; nested: { value: bigint } };
 * type WithString = BigIntToString<WithBigInt>;
 * // Result: { id: string; amount: string; nested: { value: string } }
 * ```
 */
export type BigIntToString<T> = T extends bigint
  ? string | bigint
  : T extends Array<infer U>
    ? Array<BigIntToString<U>>
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<BigIntToString<U>>
      : T extends Record<string, any>
        ? {
            [K in keyof T]: BigIntToString<T[K]>;
          }
        : T;
