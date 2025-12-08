"use client";

import { use1inchFillLimitOrder } from "@acme/client/services/1inche/use1inchFillLimitOrder";
import { useLimitOrderProtocolAddress } from "@acme/client/services/1inche/useLimitOrderProtocolAddress";
import { useTokenApproval } from "@acme/client/services/erc20/useTokenApproval";
import { type LimitOrder } from "@acme/client/services/limit-order/useCreateLimitOrder";
import { toast } from "@acme/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Address } from "viem";
import { usePublicClient } from "wagmi";
import { LIMIT_ORDERS_QUERY_KEY } from "./useLimitOrders";
import { LIMIT_ORDERS_BY_TOKEN_QUERY_KEY } from "./useLimitOrdersByToken";

export const useFillLimitOrder = () => {
  const { address: limitOrderProtocolAddress } = useLimitOrderProtocolAddress();
  const {
    approveAsync,
    isPending: isTokenApproving,
    transactionReceipt: approvalTx,
  } = useTokenApproval();
  const {
    fillOrder,
    isPending: isFilling,
    transactionReceipt: fillingTx,
  } = use1inchFillLimitOrder();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const _fillOrder = async (order: LimitOrder) => {
    // 1- approve the spend
    const hash = await approveAsync(
      order.takeToken as Address,
      limitOrderProtocolAddress!,
      BigInt(order.takeAmount),
      {
        onSuccess: () => {
          toast.success("Transaction submitted, confirming...", {
            action: {
              label: "Close",
              onClick: () => {},
            },
          });
        },
      }
    );

    await publicClient?.waitForTransactionReceipt({
      hash,
    });

    // 2- fill the order
    const hash2 = await fillOrder({ order });

    await publicClient?.waitForTransactionReceipt({
      hash: hash2,
    });

    toast.success("Order filled successfully");
    queryClient.invalidateQueries({ queryKey: [LIMIT_ORDERS_QUERY_KEY] });
    queryClient.invalidateQueries({
      queryKey: [LIMIT_ORDERS_BY_TOKEN_QUERY_KEY],
    });
    return hash;
  };

  return {
    fillOrder: _fillOrder,
    isPending:
      isTokenApproving ||
      isFilling ||
      approvalTx.isLoading ||
      fillingTx.isLoading,
    isConfirming: approvalTx.isLoading || fillingTx.isLoading,
  };
};
