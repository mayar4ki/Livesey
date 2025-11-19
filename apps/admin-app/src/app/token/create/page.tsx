'use client';

import { AnimatePresence } from 'motion/react';
import { TokenCreateForm } from '../_components/create/TokenCreateForm';

import { ErrorStateCard } from '@acme/ui/bootstrapped/error-state-card';
import { Button } from '@acme/ui/button';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useWatch } from 'react-hook-form';
import { useAccount } from 'wagmi';
import { TokenSuccessCard } from '../_components/create/TokenSuccessCard';
import { TransactionStatusCard } from '../_components/create/TransactionStatusCard';
import { useBeaconProxyAddress } from '../_hooks/useBeaconProxyAddress';
import { useTokenCreation } from '../_hooks/useTokenCreation';
import { TokenCreateFormSchema, tokenCreateFormSchema } from '../_libs/tokenCreateFormSchema';

export default function Page() {
  const { address: walletAddress } = useAccount();
  const { mutateCreateToken, isPending, transactionHash, transactionReceipt, resetCreateBeaconProxy } = useTokenCreation();
  const { beaconProxyAddress, resetBeaconProxyAddress } = useBeaconProxyAddress(transactionHash);

  const form = useForm<TokenCreateFormSchema>({
    resolver: yupResolver(tokenCreateFormSchema),
    defaultValues: {
      name: 'Test Token',
      totalSupply: '1000',
      symbol: 'XY',
      owner: walletAddress,
      operator: '' as `0x${string}`,
      assetRefPairs: [{ key: '', value: '' }],
      assetRefHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    },
  });
  const tokenName = useWatch({ name: 'name', control: form.control });
  const tokenSymbol = useWatch({ name: 'symbol', control: form.control });

  function onSubmit(values: TokenCreateFormSchema) {
    mutateCreateToken(values);
  }

  function onReset() {
    resetBeaconProxyAddress();
    form.reset();
    resetCreateBeaconProxy();
  }

  return (
    <div className="p-4 md:p-6 flex-1 relative">
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {transactionReceipt.error || transactionReceipt.isError ? (
            <ErrorStateCard
              title="Error creating token"
              message={transactionReceipt.error?.message ?? 'Unknown error'}
              action={<Button onClick={() => onReset()}>Try again</Button>}
            />
          ) : transactionHash ? (
            <>
              <TransactionStatusCard txHash={transactionHash} />
              {beaconProxyAddress && (
                <TokenSuccessCard
                  tokenAddress={beaconProxyAddress as `0x${string}`}
                  tokenName={tokenName}
                  tokenSymbol={tokenSymbol}
                  onReset={onReset}
                />
              )}
            </>
          ) : (
            <TokenCreateForm form={form} onSubmit={onSubmit} isPending={isPending} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
