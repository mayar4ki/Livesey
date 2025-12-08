'use client';

import { usePauseOperator, useUnpauseOperator } from '@acme/client/services/factory/usePauseOperator';
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
import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { toast } from '@acme/ui/sonner';
import { AlertTriangle, Loader2, Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { Address } from 'viem';

type OperatorPauseSectionProps = {
  operatorAddress: Address;
  isPaused: boolean;
};

export function OperatorPauseSection({ operatorAddress, isPaused }: OperatorPauseSectionProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const { pauseOperator, isPending: isPausing, transactionReceipt: pauseTx } = usePauseOperator();
  const { unpauseOperator, isPending: isUnpausing, transactionReceipt: unpauseTx } = useUnpauseOperator();

  const isPending = isPausing || isUnpausing || pauseTx.isLoading || unpauseTx.isLoading;

  const handlePauseToggle = () => {
    setOpenDialog(false);
    if (isPaused) {
      unpauseOperator(operatorAddress, {
        onSuccess: () => {
          toast.success('Transaction submitted, confirming...', {
            action: {
              label: 'Close',
              onClick: () => {},
            },
          });
        },
      });
    } else {
      pauseOperator(operatorAddress, {
        onSuccess: () => {
          toast.success('Transaction submitted, confirming...', {
            action: {
              label: 'Close',
              onClick: () => {},
            },
          });
        },
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Operator Control</CardTitle>
          <CardDescription>Pause or unpause this operator. Paused operators cannot be used for token creation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">Pause / Unpause Operator</h4>
                <div className="text-sm text-muted-foreground">
                  {isPaused
                    ? 'Unpause this operator to allow it to be used for token creation.'
                    : 'Pause this operator to prevent it from being used for token creation.'}
                </div>
              </div>
              <Button variant={isPaused ? 'default' : 'destructive'} size="sm" onClick={() => setOpenDialog(true)} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isPausing || isUnpausing ? 'Approving...' : 'Confirming...'}
                  </>
                ) : isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Unpause
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>{isPaused ? 'Unpause Operator' : 'Pause Operator'}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4 space-y-3" asChild>
              <div>
                <p className="font-medium text-foreground">Are you sure you want to {isPaused ? 'unpause' : 'pause'} this operator?</p>
                {isPaused ? (
                  <div className="space-y-2 text-sm">
                    <p>Unpausing this operator will:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Allow this operator to be used for token creation</li>
                      <li>Restore normal operator functionality</li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <p>Pausing this operator will:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Block the operator from being assigned to new tokens</li>
                      <li>Not affect existing tokens that use this operator</li>
                    </ul>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant={isPaused ? 'default' : 'destructive'} onClick={handlePauseToggle}>
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Unpause
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
