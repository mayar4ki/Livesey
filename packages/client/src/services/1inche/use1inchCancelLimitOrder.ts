import { ONEINCH_LIMIT_ORDER_PROTOCOL_ABI } from '@acme/shared';
import { encodeFunctionData } from 'viem';
import { useChainId, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';

import { LimitOrder as DBLimitOrder } from '../limit-order/useCreateLimitOrder';
import { get1inchLimitOrderProtocolAddress } from './config';
import { reconstructLimitOrder } from './utils/1inch-order';

export interface Cancel1inchLimitOrderParams {
    order: DBLimitOrder;
}

/**
 * Cancels a limit order by sending a transaction to the Limit Order Protocol contract
 * Only the maker (order creator) can cancel their own orders
 */
export function use1inchCancelLimitOrder() {
    const chainId = useChainId();

    const { sendTransaction, data, ...rest } = useSendTransaction({});

    const cancelOrder = async (params: Cancel1inchLimitOrderParams) => {
        const { order } = params;

        // Reconstruct the LimitOrder to get makerTraits
        const limitOrder = reconstructLimitOrder(order);
        const orderData = limitOrder.build();

        // Encode the cancelOrder function call
        const calldata = encodeFunctionData({
            abi: ONEINCH_LIMIT_ORDER_PROTOCOL_ABI,
            functionName: 'cancelOrder',
            args: [BigInt(orderData.makerTraits), order.orderHash as `0x${string}`],
        });

        sendTransaction({
            to: get1inchLimitOrderProtocolAddress(chainId),
            data: calldata,
        });
    };

    const transactionReceipt = useWaitForTransactionReceipt({
        hash: data,
        query: {
            enabled: !!data,
        },
    });

    return {
        cancelOrder,
        data,
        ...rest,
        transactionReceipt,
    };
}

