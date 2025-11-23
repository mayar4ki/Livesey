'use client';

import { Button } from '@acme/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { type LimitOrder } from '~/services/limit-order/useCreateLimitOrder';

interface LimitOrderActionsProps {
  order: LimitOrder;
}

export function LimitOrderActions({ order }: LimitOrderActionsProps) {
  const isPending = order.status === 'pending';
  const isExpired = order.status === 'expired';
  const isFilled = order.status === 'filled';
  const isCancelled = order.status === 'cancelled';

  const handleFillOrder = () => {
    // TODO: Implement fill order logic
    console.log('Filling order:', order.orderHash);
  };

  if (isFilled || isCancelled) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  if (isExpired) {
    return (
      <Button variant="outline" size="sm" disabled className="text-xs">
        Expired
      </Button>
    );
  }

  return (
    <Button variant="default" size="sm" onClick={handleFillOrder} disabled={!isPending} className="text-xs">
      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
      Fill Order
    </Button>
  );
}
