import { LimitOrderContract, TakerTraits } from '@1inch/limit-order-sdk';
import { useChainId, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';

import { LimitOrder as DBLimitOrder } from '../limit-order/useCreateLimitOrder';
import { get1inchLimitOrderProtocolAddress } from './config';
import { reconstructLimitOrder } from './utils/1inch-order';

export interface Fill1inchLimitOrderParams {
  order: DBLimitOrder;
}

/**
 * Fills a limit order by sending a transaction to the Limit Order Protocol contract
 */
export function use1inchFillLimitOrder() {
  const chainId = useChainId();

  const { sendTransaction, data, ...rest } = useSendTransaction({});

  const fillOrder = async (params: Fill1inchLimitOrderParams) => {
    const { order } = params;

    const orderData = reconstructLimitOrder(order).build();

    const _data = LimitOrderContract.getFillOrderCalldata(
      orderData,
      order.signature as `0x${string}`,
      TakerTraits.default(),
      BigInt(order.takeAmount)
    );

    sendTransaction({
      to: get1inchLimitOrderProtocolAddress(chainId),
      data: _data as `0x${string}`,
      gas: 16_000_000n,
    });
  };

  const transactionReceipt = useWaitForTransactionReceipt({
    hash: data,
    query: {
      enabled: !!data,
    },
  });

  return {
    fillOrder,
    data,
    ...rest,
    transactionReceipt,
  };
}
