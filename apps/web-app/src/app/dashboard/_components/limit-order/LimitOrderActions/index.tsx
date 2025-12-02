'use client';

import { type LimitOrder } from '~/services/limit-order/useCreateLimitOrder';
import { CancelOrderAction } from './CancelOrderAction';
import { FillOrderAction } from './FillOrderAction';

interface LimitOrderActionsProps {
  order: LimitOrder;
}

export function LimitOrderActions({ order }: LimitOrderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <FillOrderAction order={order} />
      <CancelOrderAction order={order} />
    </div>
  );
}
