'use client';

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
import { usePauseToken, useUnpauseToken } from '~/services/factory/usePauseToken';

type TokenPauseSectionProps = {
  tokenAddress: Address;
  isPaused: boolean;
};

export function TokenPauseSection({ tokenAddress, isPaused }: TokenPauseSectionProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const { pauseToken, isPending: isPausing, transactionReceipt: pauseTx } = usePauseToken();
  const { unpauseToken, isPending: isUnpausing, transactionReceipt: unpauseTx } = useUnpauseToken();

  const isPending = isPausing || isUnpausing || pauseTx.isLoading || unpauseTx.isLoading;

  const handlePauseToggle = () => {
    setOpenDialog(false);
    if (isPaused) {
      unpauseToken(tokenAddress, {
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
      pauseToken(tokenAddress, {
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
          <CardTitle>Token Control</CardTitle>
          <CardDescription>Pause or unpause this token. Paused tokens cannot be transferred.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">Pause / Unpause Token</h4>
                <div className="text-sm text-muted-foreground">
                  {isPaused ? 'Unpause this token to allow transfers to resume.' : 'Pause this token to prevent all transfers.'}
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
              <AlertDialogTitle>{isPaused ? 'Unpause Token' : 'Pause Token'}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4 space-y-3" asChild>
              <div>
                <p className="font-medium text-foreground">Are you sure you want to {isPaused ? 'unpause' : 'pause'} this token?</p>
                {isPaused ? (
                  <div className="space-y-2 text-sm">
                    <p>Unpausing this token will:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Allow token transfers to resume</li>
                      <li>Restore normal token functionality</li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <p>Pausing this token will:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Immediately pause all token transfers</li>
                      <li>Prevent users from sending or receiving tokens</li>
                      <li>Not affect token balances or ownership</li>
                    </ul>
                    <p className="pt-2 font-medium text-destructive">This action is reversible, but will require another transaction to unpause.</p>
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
