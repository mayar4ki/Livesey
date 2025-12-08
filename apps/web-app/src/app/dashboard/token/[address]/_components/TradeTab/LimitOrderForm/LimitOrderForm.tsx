'use client';

import { BaseCurrency } from '@acme/client/services/1inche/config/index';
import { useLimitOrderTokens } from '@acme/client/services/1inche/useLimitOrderTokens';
import { useCreateLimitOrder } from '@acme/client/services/limit-order/useCreateLimitOrder';
import { Token } from '@acme/client/services/token/types';
import { Button } from '@acme/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@acme/ui/form';
import { Input } from '@acme/ui/input';
import { toast } from '@acme/ui/sonner';
import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { getOurTokenDecimals } from '~/utils/token-decimals';
import { LimitOrderInput } from './LimitOrderInput';
import { LimitOrderPriceLimitInput } from './LimitOrderPriceLimitInput';
import { limitOrderFormSchema, type LimitOrderFormSchema } from './limitOrderFormSchema';

export interface LimitOrderFormProps {
  token: Token;
  onClose?: () => void;
}

export function LimitOrderForm({ token, onClose }: LimitOrderFormProps) {
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

  const { createLimitOrder, isConfirming, isPending } = useCreateLimitOrder();

  const onSubmit = async (data: LimitOrderFormSchema) => {
    // Create and send the order (hook handles signing and backend submission)
    await createLimitOrder(
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
        approveOptions: {
          onSuccess: () => {
            toast.success('Transaction submitted, confirming...');
          },
        },
        createLimitOrderOptions: {
          onSuccess: () => {
            toast.success('Limit order created successfully');
          },
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

    onClose?.();
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* From Token Section */}

        <LimitOrderInput
          control={form.control}
          tokenFieldName="fromToken"
          tokenAmountFieldName="fromAmount"
          tokenOptions={tokens}
          baseToken={baseToken}
          disabled={isPending}
        />

        {/* Swap Button */}
        <div className="flex justify-center -my-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={handleSwap}
            disabled={isPending}
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
          disabled={isPending}
        />

        {/* Limit Price Section */}
        <LimitOrderPriceLimitInput
          control={form.control}
          limitPriceFieldName="limitPrice"
          fromAmountFieldName="fromAmount"
          toAmountFieldName="toAmount"
          fromTokenFieldName="fromToken"
          toTokenFieldName="toToken"
          disabled={isPending}
          onReset={handleReset}
        />

        {/* Expired At Section */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Expired at</span>
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
                    disabled={isPending}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {form.formState.errors.root && (
          <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isConfirming ? 'Confirming...' : 'Loading...'}
            </>
          ) : (
            'Place Limit Order'
          )}
        </Button>
      </form>
    </Form>
  );
}
