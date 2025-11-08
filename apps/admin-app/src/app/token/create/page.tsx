'use client';

import { AnimatePresence } from 'motion/react';
import { TokenCreateForm } from '../_components/TokenCreateForm';

import { Button } from '@acme/ui/button';
import { toast } from '@acme/ui/sonner';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useAccount } from 'wagmi';
import { ErrorStateCard } from '~/_components/common/ErrorStateCard';
import { useCreateBeaconProxy } from '~/services/factory/useCreateBeaconProxy';
import { useWatchBeaconProxyCreatedEvent } from '~/services/factory/useWatchBeaconProxyCreatedEvent';
import { TokenSuccessCard } from '../_components/TokenSuccessCard';
import { TransactionStatusCard } from '../_components/TransactionStatusCard';
import { TokenCreateFormSchema, tokenCreateFormSchema } from '../_libs/tokenCreateFormSchema';

export default function Page() {
  const { address: walletAddress } = useAccount();
  const router = useRouter();
  const { createBeaconProxy, isPending, data: transactionHash, error, transactionReceipt } = useCreateBeaconProxy();
  const [beaconProxyAddress, setBeaconProxyAddress] = useState<string | null>(null);

  useWatchBeaconProxyCreatedEvent({
    onLogs: (logs) => {
      if (logs?.[0] && logs[0].transactionHash === transactionHash && logs[0].args.createdBeaconProxy) {
        setBeaconProxyAddress(logs[0].args.createdBeaconProxy);
        toast.success('Token created transaction is confirmed');
      }
    },
    enabled: !!transactionHash && !!!beaconProxyAddress && !!!transactionReceipt.isError,
  });

  const form = useForm<TokenCreateFormSchema>({
    resolver: yupResolver(tokenCreateFormSchema),
    defaultValues: {
      name: 'Test Token',
      totalSupply: '1000',
      symbol: 'XY',
      owner: walletAddress,
    },
  });
  const tokenName = useWatch({ name: 'name', control: form.control });
  const tokenSymbol = useWatch({ name: 'symbol', control: form.control });

  function onSubmit(values: TokenCreateFormSchema) {
    createBeaconProxy([values.name, values.symbol, BigInt(values.totalSupply), values.owner], {
      onSuccess: () => {
        toast.success('Token created transaction is sent to the network');
      },
    });
  }

  return (
    <div className="p-4 md:p-6 flex-1 relative">
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {error ? (
            <ErrorStateCard
              title="Error creating token"
              message={error.message ?? 'Unknown error'}
              action={<Button onClick={() => router.refresh()}>Try again</Button>}
            />
          ) : transactionHash ? (
            <>
              <TransactionStatusCard txHash={transactionHash} />
              {beaconProxyAddress && tokenName && tokenSymbol && (
                <TokenSuccessCard tokenAddress={beaconProxyAddress as `0x${string}`} tokenName={tokenName} tokenSymbol={tokenSymbol} />
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
