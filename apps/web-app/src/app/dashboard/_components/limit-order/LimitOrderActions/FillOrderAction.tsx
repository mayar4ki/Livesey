'use client';

import { LimitOrderType, type LimitOrder } from '@acme/client/services/limit-order/useCreateLimitOrder';
import { useFillLimitOrder } from '@acme/client/services/limit-order/useFillLimitOrder';
import { formatDateTime, formatTokenAmount } from '@acme/client/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@acme/ui/alert-dialog';
import { Badge } from '@acme/ui/badge';
import { Button } from '@acme/ui/button';
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useGetOrderTokensInfo } from '~/_hooks/useGetOrderTokensInfo';

interface FillOrderActionProps {
  order: LimitOrder;
}

export function FillOrderAction({ order }: FillOrderActionProps) {
  const [openDialog, setOpenDialog] = useState(false);

  const { fillOrder, isPending, isConfirming } = useFillLimitOrder();

  const handleFillOrder = async () => {
    setOpenDialog(false);
    fillOrder(order);
  };

  const getOrderTokensInfo = useGetOrderTokensInfo();
  const { makeTokenInfo, takeTokenInfo, _price } = getOrderTokensInfo(order);
  const isOrderPending = order.status === 'pending';
  const isOrderExpired = new Date() > new Date(Number(order.expiration) * 1000);
  const isSell = order.type === LimitOrderType.SELL;

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => setOpenDialog(true)}
        disabled={!isOrderPending || isOrderExpired || isPending}
        className="text-xs"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {isConfirming ? 'Confirming...' : 'Loading...'}
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            {isOrderExpired ? 'Expired' : 'Fill Order'}
          </>
        )}
      </Button>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>Fill Limit Order</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4 space-y-4" asChild>
              <div>
                {/* Main Exchange Display */}
                <div className="p-5 bg-linear-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
                  <div className="flex items-center justify-between gap-4">
                    {/* You Pay */}
                    <div className="flex-1 text-center">
                      <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                        You Pay
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {formatTokenAmount(order.takeAmount, takeTokenInfo?.decimals ?? 18)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{takeTokenInfo?.symbol ?? 'Token'}</div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="h-6 w-6 text-primary shrink-0 mt-8" />

                    {/* You Receive */}
                    <div className="flex-1 text-center">
                      <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                        You Receive
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {formatTokenAmount(order.makeAmount, makeTokenInfo?.decimals ?? 18)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{makeTokenInfo?.symbol ?? 'Token'}</div>
                    </div>
                  </div>

                  {/* Price Info */}
                  <div className="mt-4 pt-4 border-t border-primary/20 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Price</div>
                    <div className="text-sm font-semibold text-foreground">
                      ~{_price} {isSell ? takeTokenInfo?.symbol : makeTokenInfo?.symbol} per 1{' '}
                      {isSell ? makeTokenInfo?.symbol : takeTokenInfo?.symbol}
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-muted-foreground">Order Type</span>
                    <Badge className={isSell ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}>
                      {isSell ? 'SELL' : 'BUY'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-muted-foreground">Expires</span>
                    <span className="font-medium text-foreground">
                      {formatDateTime(new Date(Number(order.expiration) * 1000))}
                    </span>
                  </div>
                </div>

                {/* Warning */}
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">
                    This will execute the transaction and consume gas fees. Please review the details above before
                    confirming.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="default" onClick={handleFillOrder}>
                Fill Order
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
