'use client';

import { useAddOperator } from '@acme/client/services/factory/useAddOperator';
import { ErrorStateCard } from '@acme/ui/bootstrapped/error-state-card';
import { Button } from '@acme/ui/button';
import { toast } from '@acme/ui/sonner';
import { yupResolver } from '@hookform/resolvers/yup';
import { AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { TransactionStatusCard } from '../../token/_components/create/TransactionStatusCard';
import { OperatorCreateForm } from '../_components/create/OperatorCreateForm';
import { OperatorCreateFormSchema, operatorCreateFormSchema } from '../_libs/operatorCreateFormSchema';

export default function Page() {
  const router = useRouter();
  const { addOperator, isPending, data: transactionHash, transactionReceipt, reset: resetAddOperator } = useAddOperator();
  const hasRedirected = useRef(false);

  const form = useForm<OperatorCreateFormSchema>({
    resolver: yupResolver(operatorCreateFormSchema),
    defaultValues: {
      operatorAddress: '' as `0x${string}`,
    },
  });

  function onSubmit(values: OperatorCreateFormSchema) {
    addOperator(values.operatorAddress);
  }

  function onReset() {
    form.reset();
    resetAddOperator();
    hasRedirected.current = false;
  }

  useEffect(() => {
    if (transactionReceipt.isSuccess && !hasRedirected.current) {
      hasRedirected.current = true;
      toast.success('Operator added successfully!', {
        description: 'The operator has been added to the Factory contract',
      });
    }
  }, [transactionReceipt.isSuccess, router]);

  return (
    <div className="p-4 md:p-6 flex-1 relative">
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {transactionReceipt.error || transactionReceipt.isError ? (
            <ErrorStateCard
              title="Error adding operator"
              message={transactionReceipt.error?.message ?? 'Unknown error'}
              action={<Button onClick={() => onReset()}>Try again</Button>}
            />
          ) : transactionHash ? (
            <TransactionStatusCard txHash={transactionHash} />
          ) : (
            <OperatorCreateForm form={form} onSubmit={onSubmit} isPending={isPending} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
