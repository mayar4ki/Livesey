'use client';

import { useDistributeDividends } from '@acme/client/services/erc20/useDistributeDividends';
import { Token } from '@acme/client/services/token/types';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@acme/ui/form';
import { Input } from '@acme/ui/input';
import { toast } from '@acme/ui/sonner';
import { yupResolver } from '@hookform/resolvers/yup';
import { AlertTriangle, ArrowDown, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Address, parseUnits } from 'viem';

import { useRewardTokenInfo } from '@acme/client/services/factory/useRewardTokenInfo';
import { Spinner } from '@acme/ui/spinner';
import { DistributeDividendsFormSchema, distributeDividendsSchema } from './distributeDividendsSchema';

export interface DistributeDividendsFormProps {
  token: Token;
}

export const DistributeDividendsForm = ({ token }: DistributeDividendsFormProps) => {
  const [openDialog, setOpenDialog] = useState(false);

  const { rewardToken, symbol: rewardTokenSymbol, decimals: rewardTokenDecimals, isLoading: isRewardLoading } = useRewardTokenInfo();

  const { distribute, isPending, isConfirming } = useDistributeDividends(token.token as Address, rewardToken as Address | undefined);

  const form = useForm<DistributeDividendsFormSchema>({
    resolver: yupResolver(distributeDividendsSchema),
    defaultValues: {
      amount: '',
    },
  });

  const onSubmit = (values: DistributeDividendsFormSchema) => {
    setOpenDialog(true);
  };

  const handleConfirm = async () => {
    setOpenDialog(false);
    const values = form.getValues();

    await distribute(parseUnits(values.amount, rewardTokenDecimals!), {
      approveOptions: {
        onSuccess: () => {
          toast.success('Approval submitted. Waiting for confirmation...');
        },
      },
      onDistributeTxSuccess: () => {
        toast.success('Dividends distributed successfully');
        form.reset();
      },
    });
  };

  const isFormDisabled = isPending || isConfirming || isRewardLoading || rewardTokenDecimals === undefined;
  const amount = form.watch('amount');

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount to distribute</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min={0} step="any" inputMode="decimal" placeholder="0.0" disabled={isFormDisabled} />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Funds are sent to {token.symbol} holders in {rewardTokenSymbol ?? 'reward token'} units.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              This action calls <code>distributeDividends</code> and can only be performed by the operator wallet.
            </p>
            <Button type="submit" disabled={isFormDisabled} className="sm:w-auto w-full">
              {isPending ? (
                <>
                  <Spinner />
                  {isConfirming ? 'Confirming...' : 'Processing...'}
                </>
              ) : (
                <>
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Distribute profits
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>Distribute Dividends</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4 space-y-4" asChild>
              <div>
                {/* Main Distribution Display */}
                <div className="p-5 bg-linear-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
                  <div className="flex items-center justify-between gap-4">
                    {/* You Distribute */}
                    <div className="flex-1 text-center">
                      <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">You Distribute</div>
                      <div className="text-2xl font-bold text-foreground">
                        {amount} {rewardTokenSymbol ?? 'Token'}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{rewardTokenSymbol ?? 'Reward Token'}</div>
                    </div>

                    {/* Arrow */}
                    <ArrowDown className="h-6 w-6 text-primary shrink-0 mt-8" />

                    {/* Recipients */}
                    <div className="flex-1 text-center">
                      <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">To {token.symbol} Holders</div>
                      <div className="text-2xl font-bold text-primary">{token.symbol}</div>
                      <div className="text-sm text-muted-foreground mt-1">Token Holders</div>
                    </div>
                  </div>

                  {/* Distribution Info */}
                  <div className="mt-4 pt-4 border-t border-primary/20 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Distribution Method</div>
                    <div className="text-sm font-semibold text-foreground">Proportional to token balance</div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-muted-foreground">Target Token</span>
                    <span className="font-medium text-foreground">{token.symbol}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-muted-foreground">Reward Token</span>
                    <span className="font-medium text-foreground">{rewardTokenSymbol ?? 'Loading...'}</span>
                  </div>
                </div>

                {/* Warning */}
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">
                    This will execute the transaction and consume gas fees. Please review the details above before confirming.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending || isConfirming}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="default" onClick={handleConfirm} disabled={isPending || isConfirming}>
                Distribute Dividends
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
