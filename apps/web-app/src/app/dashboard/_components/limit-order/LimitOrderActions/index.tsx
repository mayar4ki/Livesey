'use client';

import { useAccount } from 'wagmi';
import { type LimitOrder } from '~/services/limit-order/useCreateLimitOrder';
import { CancelOrderAction } from './CancelOrderAction';
import { FillOrderAction } from './FillOrderAction';

interface LimitOrderActionsProps {
  order: LimitOrder;
}

export function LimitOrderActions({ order }: LimitOrderActionsProps) {
  const isOrderPending = order.status === 'pending';
  const isOrderCancelled = order.status === 'cancelled';
  const isOrderFilled = order.status === 'filled';

  const { address } = useAccount();

  const isOrderOwner = order.maker === address;

  return (
    <div className="flex items-center gap-2">
      {!isOrderOwner && <FillOrderAction order={order} />}
      {isOrderPending && isOrderOwner && <CancelOrderAction order={order} />}
    </div>
  );
}
