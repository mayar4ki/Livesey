import { Address, LimitOrder, MakerTraits } from "@1inch/limit-order-sdk";

import { LimitOrder as DBLimitOrder } from "@acme/client/services/limit-order/useCreateLimitOrder";

export function makeTraits(expiration: bigint, nonce: bigint) {
  return MakerTraits.default()
    .disablePartialFills()
    .disableMultipleFills()
    .withExpiration(expiration)
    .withNonce(nonce);
}

/**
 * Reconstructs a LimitOrder SDK object from database order data
 * This is useful when you need to work with an order that was stored in the database
 * and need to convert it back to the 1inch SDK LimitOrder format
 *
 * @param order - The limit order data from the database
 * @returns A LimitOrder SDK object that can be used with 1inch SDK methods
 */
export function reconstructLimitOrder(order: DBLimitOrder): LimitOrder {
  return new LimitOrder(
    {
      makerAsset: new Address(order.makeToken),
      takerAsset: new Address(order.takeToken),
      makingAmount: BigInt(order.makeAmount),
      takingAmount: BigInt(order.takeAmount),
      maker: new Address(order.maker),
      receiver: new Address(order.maker), // Usually the maker receives
      salt: BigInt(order.salt),
    },
    makeTraits(BigInt(order.expiration), BigInt(order.nonce))
  );
}
