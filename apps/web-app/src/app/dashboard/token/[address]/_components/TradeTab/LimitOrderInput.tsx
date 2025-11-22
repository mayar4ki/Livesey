'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@acme/ui/avatar';
import { Button } from '@acme/ui/button';
import { FormControl, FormField, FormItem, FormMessage } from '@acme/ui/form';
import { Input } from '@acme/ui/input';
import { useMemo } from 'react';
import { Control, ControllerProps, FieldPath, FieldValues, useController } from 'react-hook-form';
import { formatUnits } from 'viem';
import { BaseCurrency } from '~/_config/1inch';
import { useTokenBalance } from '~/services/erc20/useTokenBalance';
import { SelectTokenDialog } from '../SelectTokenDialog';

export interface LimitOrderInputProps<TFieldValues extends FieldValues = FieldValues, TContext = any, TTransformedValues = TFieldValues> {
  control: Control<TFieldValues, TContext, TTransformedValues>;
  tokenFieldName: ControllerProps<TFieldValues, FieldPath<TFieldValues>, TTransformedValues>['name'];
  tokenOptions: BaseCurrency[];
  tokenAmountFieldName: ControllerProps<TFieldValues, FieldPath<TFieldValues>, TTransformedValues>['name'];
  disabled?: boolean;
  baseToken: BaseCurrency;

  hidePercentageSelector?: boolean;
}

export const LimitOrderInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(
  props: LimitOrderInputProps<TFieldValues, TName, TTransformedValues>
) => {
  const { control, tokenFieldName, tokenAmountFieldName, disabled, tokenOptions, baseToken, hidePercentageSelector = false } = props;

  const tokenAmountField = useController({
    name: tokenAmountFieldName,
    control,
  });

  const tokenField = useController({
    name: tokenFieldName,
    control,
  });

  const tokenFieldValue = tokenField?.field?.value as BaseCurrency | undefined;
  const tokenDecimals = tokenFieldValue?.decimals;

  const { data: tokenBalance } = useTokenBalance(tokenFieldValue?.address);

  const balance = useMemo(() => {
    return tokenBalance && tokenDecimals ? formatUnits(tokenBalance.value, tokenDecimals) : '0';
  }, [tokenBalance, tokenDecimals]);

  const handlePercentageClick = (percentage: number) => {
    const amount = parseFloat(balance) * (percentage / 100);

    tokenAmountField.field.onChange(amount);
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className=" size-7 text-sm ">
            <AvatarImage src={tokenFieldValue?.name} alt="1" />
            <AvatarFallback>{tokenFieldValue?.symbol?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <SelectTokenDialog
            options={tokenOptions}
            value={tokenFieldValue ?? null}
            onChange={(token) => tokenField.field.onChange(token)}
            disabled={disabled || tokenFieldValue?.address === baseToken.address}
          />
        </div>
        <span className="text-sm text-muted-foreground">Balance: {parseFloat(balance).toFixed(4)}</span>
      </div>

      <FormField
        control={control as any}
        name={tokenAmountFieldName}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input type="number" placeholder="0.0" className="text-lg font-medium" {...field} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {!hidePercentageSelector && (
        <div className="flex gap-2">
          {[25, 50, 75, 100].map((percentage) => (
            <Button
              key={percentage}
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => handlePercentageClick(percentage)}
              disabled={disabled || balance === '0'}
            >
              {percentage === 100 ? 'MAX' : `${percentage}%`}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
