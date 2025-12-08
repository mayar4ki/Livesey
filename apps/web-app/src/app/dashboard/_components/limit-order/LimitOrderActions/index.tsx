'use client';

import { type LimitOrder } from '@acme/client/services/limit-order/useCreateLimitOrder';
import { useAccount } from 'wagmi';
import { CancelOrderAction } from './CancelOrderAction';
import { FillOrderAction } from './FillOrderAction';

interface LimitOrderActionsProps {
  order: LimitOrder;
}

export function LimitOrderActions({ order }: LimitOrderActionsProps) {
  const isOrderPending = order.status === 'pending';

  const { address } = useAccount();

  const isOrderOwner = order.maker === address;

  return (
    <div className="flex items-center gap-2">
      {!isOrderOwner && <FillOrderAction order={order} />}
      {isOrderPending && isOrderOwner && <CancelOrderAction order={order} />}
    </div>
  );
}
