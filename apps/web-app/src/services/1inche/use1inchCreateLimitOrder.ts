import { Address, LimitOrder, randBigInt } from '@1inch/limit-order-sdk';
import { oneInchLimitOrderProtocolEip712 } from '@acme/shared';
import { hashTypedData, parseUnits } from 'viem';
import { useAccount, useChainId, useSignTypedData } from 'wagmi';
import { makeTraits } from './utils/1inch-order';

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

export function use1inchCreateLimitOrder() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { signTypedDataAsync } = useSignTypedData();

  const signOrderTypedDataAsync = async (order: LimitOrder) => {
    // const typedData = order.getTypedData(chainId);

    const signature = await signTypedDataAsync({
      domain: oneInchLimitOrderProtocolEip712.getDomain(chainId),
      types: { Order: oneInchLimitOrderProtocolEip712.types.Order },
      primaryType: oneInchLimitOrderProtocolEip712.primaryType,
      message: order.build(),
    });

    return signature;
  };

  const createLimitOrder = async (params: Create1inchLimitOrderParams): Promise<Create1inchLimitOrderResult> => {
    const { makeToken, takeToken, makeAmount, takeAmount, makeTokenDecimals, takeTokenDecimals, expiration } =
      params;

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
      makeTraits(BigInt(expiration), nonce)
    );

    const signature = await signOrderTypedDataAsync(order);

    return {
      order,
      orderHash: hashTypedData({
        domain: oneInchLimitOrderProtocolEip712.getDomain(chainId),
        types: { Order: oneInchLimitOrderProtocolEip712.types.Order },
        primaryType: oneInchLimitOrderProtocolEip712.primaryType,
        message: order.build(),
      }),
      signature,
      nonce,
      expiration: BigInt(expiration),
    };
  };

  return {
    createLimitOrder,
  };
}
