'use client';

import { Button } from '@acme/ui/button';
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from '@acme/ui/form';
import { Input } from '@acme/ui/input';
import { HelpCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Control, ControllerProps, FieldPath, FieldValues, useController, useWatch } from 'react-hook-form';
import { BaseCurrency } from '~/_config/1inch';

export interface LimitOrderPriceLimitInputProps<TFieldValues extends FieldValues = FieldValues, TContext = any, TTransformedValues = TFieldValues> {
  control: Control<TFieldValues, TContext, TTransformedValues>;
  limitPriceFieldName: ControllerProps<TFieldValues, FieldPath<TFieldValues>, TTransformedValues>['name'];
  fromAmountFieldName: ControllerProps<TFieldValues, FieldPath<TFieldValues>, TTransformedValues>['name'];
  toAmountFieldName: ControllerProps<TFieldValues, FieldPath<TFieldValues>, TTransformedValues>['name'];
  fromTokenFieldName: ControllerProps<TFieldValues, FieldPath<TFieldValues>, TTransformedValues>['name'];
  toTokenFieldName: ControllerProps<TFieldValues, FieldPath<TFieldValues>, TTransformedValues>['name'];
  disabled?: boolean;
  onReset?: () => void;
}

export const LimitOrderPriceLimitInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(
  props: LimitOrderPriceLimitInputProps<TFieldValues, TName, TTransformedValues>
) => {
  const { control, limitPriceFieldName, fromAmountFieldName, toAmountFieldName, fromTokenFieldName, toTokenFieldName, disabled, onReset } = props;

  // Use controllers to get field onChange methods
  const limitPriceController = useController({ control, name: limitPriceFieldName });
  const toAmountController = useController({ control, name: toAmountFieldName });

  // Watch all relevant fields
  const fromAmount = useWatch({ control, name: fromAmountFieldName });
  const toAmount = useWatch({ control, name: toAmountFieldName });
  const fromToken = useWatch({ control, name: fromTokenFieldName }) as BaseCurrency | undefined;
  const toToken = useWatch({ control, name: toTokenFieldName }) as BaseCurrency | undefined;
  const limitPrice = useWatch({ control, name: limitPriceFieldName });

  // Track if price change is from user input or auto-calculation
  const isUserInputRef = useRef(false);
  const lastCalculatedPriceRef = useRef<string>('');

  // Auto-calculate price when fromAmount or toAmount changes (but not when user is typing in price field)
  useEffect(() => {
    // Skip if user is currently editing the price field
    if (isUserInputRef.current) {
      return;
    }

    const fromValue = parseFloat(fromAmount || '0');
    const toValue = parseFloat(toAmount || '0');

    if (fromValue > 0 && toValue > 0) {
      const calculatedPrice = toValue / fromValue;
      const formattedPrice = calculatedPrice.toFixed(8).replace(/\.?0+$/, '');

      // Only update if the calculated price is different from what's displayed
      if (formattedPrice !== lastCalculatedPriceRef.current && formattedPrice !== limitPriceController.field.value) {
        lastCalculatedPriceRef.current = formattedPrice;
        limitPriceController.field.onChange(formattedPrice);
      }
    } else if (!fromAmount && !toAmount && limitPriceController.field.value) {
      lastCalculatedPriceRef.current = '';
      limitPriceController.field.onChange('');
    }
  }, [fromAmount, toAmount, limitPriceController]);

  const handlePriceChange = (value: string) => {
    isUserInputRef.current = true;
    const priceValue = parseFloat(value || '0');
    const fromValue = parseFloat(fromAmount || '0');

    // Update the price field
    limitPriceController.field.onChange(value);

    if (priceValue > 0 && fromValue > 0) {
      // Calculate new toAmount based on price: toAmount = fromAmount * price
      const newToAmount = (fromValue * priceValue).toFixed(8).replace(/\.?0+$/, '');
      toAmountController.field.onChange(newToAmount);
    }

    // Reset flag after a short delay
    setTimeout(() => {
      isUserInputRef.current = false;
    }, 100);
  };

  const handleReset = () => {
    isUserInputRef.current = false;
    lastCalculatedPriceRef.current = '';
    onReset?.();
  };

  // Format price description: "1 Token = 22 Token2"
  const priceDescription = (() => {
    const priceValue = parseFloat(limitPrice || '0');
    if (priceValue > 0 && fromToken?.symbol && toToken?.symbol) {
      const formattedPrice = priceValue.toFixed(8).replace(/\.?0+$/, '');
      return `1 ${fromToken.symbol} = ${formattedPrice} ${toToken.symbol}`;
    }
    return null;
  })();

  return (
    <div className="space-y-2 pt-4 border-t">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Limit price </span>
          <Button variant="ghost" size="icon" className="h-4 w-4">
            <HelpCircle className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={handleReset} disabled={disabled}>
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              // TODO: Fetch current market price and set it
              // This would need to be passed as a prop or handled by parent
            }}
            disabled={disabled}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <FormField
        control={control as any}
        name={limitPriceFieldName}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                type="number"
                step="any"
                placeholder="0.0"
                className="text-lg font-medium"
                {...field}
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e);
                  handlePriceChange(e.target.value);
                }}
                disabled={disabled}
              />
            </FormControl>
            {priceDescription && <FormDescription className="text-xs text-muted-foreground">{priceDescription}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
