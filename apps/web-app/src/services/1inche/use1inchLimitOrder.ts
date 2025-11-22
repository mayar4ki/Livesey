import { Address, LimitOrder, MakerTraits, randBigInt } from '@1inch/limit-order-sdk';
import { parseUnits } from 'viem';
import { useAccount, useChainId, useSignTypedData } from 'wagmi';

export interface Create1inchLimitOrderParams {
  makeToken: string;
  takeToken: string;
  makeAmount: string;
  takeAmount: string;
  makeTokenDecimals: number;
  takeTokenDecimals: number;
  expiration: number;
}

export interface Create1inchLimitOrderResult {
  order: LimitOrder;
  orderHash: string;
  signature: string;
  nonce: bigint;
  expiration: bigint;
}

export function use1inchLimitOrder() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { signTypedDataAsync } = useSignTypedData();

  const signOrderTypedDataAsync = async (order: LimitOrder) => {
    const typedData = order.getTypedData(chainId);
    const signature = await signTypedDataAsync({
      domain: typedData.domain,
      types: { Order: typedData.types.Order },
      primaryType: 'Order',
      message: typedData.message,
    });

    return signature;
  };

  const createLimitOrder = async (params: Create1inchLimitOrderParams): Promise<Create1inchLimitOrderResult> => {
    const { makeToken, takeToken, makeAmount, takeAmount, makeTokenDecimals, takeTokenDecimals, expiration } = params;

    const makingAmount = parseUnits(makeAmount, makeTokenDecimals);
    const takingAmount = parseUnits(takeAmount, takeTokenDecimals);
    const nonce = randBigInt(0xffffffffffn);

    const order = new LimitOrder(
      {
        makerAsset: new Address(makeToken),
        takerAsset: new Address(takeToken),
        makingAmount,
        takingAmount,
        maker: new Address(address!),
        receiver: new Address(address!),
      },
      MakerTraits.default().withExpiration(BigInt(expiration)).withNonce(nonce)
    );

    const signature = await signOrderTypedDataAsync(order);

    return {
      order,
      orderHash: order.getOrderHash(chainId),
      signature,
      nonce,
      expiration: BigInt(expiration),
    };
  };

  return {
    createLimitOrder,
  };
}
