'use client';

import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@acme/ui/form';
import { Input } from '@acme/ui/input';
import { toast } from '@acme/ui/sonner';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowUpDown, HelpCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { parseUnits } from 'viem';
import { usePublicClient } from 'wagmi';
import { BaseCurrency } from '~/services/1inche/config';
import { useLimitOrderProtocolAddress } from '~/services/1inche/useLimitOrderProtocolAddress';
import { useLimitOrderTokens } from '~/services/1inche/useLimitOrderTokens';
import { useTokenApproval } from '~/services/erc20/useTokenApproval';
import { useCreateLimitOrder } from '~/services/limit-order/useCreateLimitOrder';
import { Token } from '~/services/token/useToken';
import { getOurTokenDecimals } from '~/utils/token-decimals';
import { LimitOrderInput } from './LimitOrderInput';
import { LimitOrderPriceLimitInput } from './LimitOrderPriceLimitInput';
import { limitOrderFormSchema, type LimitOrderFormSchema } from './limitOrderFormSchema';

export interface LimitOrderCardProps {
  token: Token;
  className?: string;
}

export function LimitOrderCard({ token, className }: LimitOrderCardProps) {
  const { address: limitOrderProtocolAddress } = useLimitOrderProtocolAddress();
  const { tokens } = useLimitOrderTokens();

  const baseToken: BaseCurrency = {
    address: token.token,
    symbol: token.symbol,
    name: token.name,
    decimals: getOurTokenDecimals(),
  };

  const nowWithExtraHour = new Date(Date.now() + 3600 * 1000).toISOString().slice(0, 16);

  const form = useForm<LimitOrderFormSchema>({
    resolver: yupResolver(limitOrderFormSchema),
    defaultValues: {
      fromToken: tokens[0],
      toToken: baseToken,
      limitPrice: '',
      expiredAt: nowWithExtraHour,
    },
  });

  // 1- approve the spend
  const { approveAsync, isPending: isTokenApproving, transactionReceipt: approvalTx } = useTokenApproval();
  // 2- create and send order (handles signing and backend submission)
  const createOrderMutation = useCreateLimitOrder();

  const isApproving = isTokenApproving || approvalTx.isLoading;
  const isLoading = isApproving || createOrderMutation.isPending;

  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const onSubmit = async (data: LimitOrderFormSchema) => {
    const hash = await approveAsync(
      data.fromToken.address,
      limitOrderProtocolAddress!,
      parseUnits(data.fromAmount, data.toToken.decimals),
      {
        onSuccess: () => {
          toast.success('Transaction submitted, confirming...', {
            action: {
              label: 'Close',
              onClick: () => {},
            },
          });
        },
      }
    );

    await publicClient?.waitForTransactionReceipt({
      hash,
    });

    // Create and send the order (hook handles signing and backend submission)
    await createOrderMutation.mutateAsync(
      {
        makeToken: data.fromToken.address,
        takeToken: data.toToken.address,
        makeAmount: data.fromAmount,
        takeAmount: data.toAmount,
        makeTokenDecimals: data.fromToken.decimals,
        takeTokenDecimals: data.toToken.decimals,
        expiration: Math.floor(new Date(data.expiredAt).getTime() / 1000),
      },
      {
        onSuccess: () => {
          toast.success('Limit order created successfully', {
            action: {
              label: 'Close',
              onClick: () => {},
            },
          });

          queryClient.invalidateQueries({ queryKey: ['limit-orders-by-token', token.token, token.chainId] });
        },
      }
    );

    form.reset({
      fromToken: data.fromToken,
      toToken: data.toToken,
      fromAmount: '',
      toAmount: '',
      limitPrice: '',
      expiredAt: nowWithExtraHour,
    });
  };

  const handleSwap = () => {
    const currentFrom = form.getValues('fromToken');
    const currentTo = form.getValues('toToken');
    form.setValue('fromToken', currentTo);
    form.setValue('toToken', currentFrom);
    form.setValue('fromAmount', '');
    form.setValue('toAmount', '');
    form.setValue('limitPrice', '');
  };

  const handleReset = () => {
    form.setValue('fromAmount', '');
    form.setValue('toAmount', '');
    form.setValue('limitPrice', '');
    form.setValue('expiredAt', new Date(Date.now() + 3600 * 1000).toISOString().slice(0, 16));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Limit Order</CardTitle>
        <CardDescription>Buy or sell tokens at a specific price.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* From Token Section */}

            <LimitOrderInput
              control={form.control}
              tokenFieldName="fromToken"
              tokenAmountFieldName="fromAmount"
              tokenOptions={tokens}
              baseToken={baseToken}
              disabled={isLoading}
            />

            {/* Swap Button */}
            <div className="flex justify-center -my-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={handleSwap}
                disabled={isLoading}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            {/* To Token Section */}
            <LimitOrderInput
              control={form.control}
              tokenFieldName="toToken"
              tokenAmountFieldName="toAmount"
              tokenOptions={tokens}
              baseToken={baseToken}
              hidePercentageSelector
              disabled={isLoading}
            />

            {/* Limit Price Section */}
            <LimitOrderPriceLimitInput
              control={form.control}
              limitPriceFieldName="limitPrice"
              fromAmountFieldName="fromAmount"
              toAmountFieldName="toAmount"
              fromTokenFieldName="fromToken"
              toTokenFieldName="toToken"
              disabled={isLoading}
              onReset={handleReset}
            />

            {/* Expired At Section */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Expired at</span>
                <Button variant="ghost" size="icon" className="h-4 w-4">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </div>
              <FormField
                control={form.control}
                name="expiredAt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="text-lg font-medium"
                        {...field}
                        disabled={isLoading}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* {needsApproval && (
              <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 p-3 rounded-md">
                Token approval required. This will be done automatically.
              </div>
            )} */}

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isApproving ? 'Approving...' : 'Processing...'}
                </>
              ) : (
                'Place Limit Order'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
