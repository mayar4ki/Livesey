'use client';

import { AnimatePresence } from 'motion/react';
import { TokenCreateForm } from '../_components/TokenCreateForm';

import { TransactionStatusCard } from '../_components/TransactionStatusCard';
import { ContractVerificationCard } from '../_components/ContractVerificationCard';
import { ErrorCard } from '../_components/ErrorCard';
import { useAccount, useChainId, useDeployContract, useWaitForTransactionReceipt } from 'wagmi';
import { ContractArtifacts } from '@acme/smart-contract';
import { Address, Hash } from 'viem';
import { tokenCreateFormSchema, TokenCreateFormSchema } from '../_libs/tokenCreateFormSchema';
import { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useVerifyToken } from '@/services/token/useVerifyToken';
import { toast } from 'sonner';
import { updateVerificationTask } from '@acme/queue/verification-task/update';
import { createVerificationTask } from '@acme/queue/verification-task';

export default function Page() {
  const [error, setError] = useState<{ message: string; type: 'transaction' | 'verification' } | null>(null);

  const { deployContract, isPending: isDeploying, data: transactionHash, error: deployError, reset: resetDeploy } = useDeployContract({});

  const chainId = useChainId();
  const { address: walletAddress } = useAccount();
  // Get transaction receipt to extract contract address
  const {
    data: receipt,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: transactionHash,
    query: {
      enabled: !!transactionHash,
    },
  });

  const contractAddress = receipt?.contractAddress;

  const form = useForm<TokenCreateFormSchema>({
    resolver: yupResolver(tokenCreateFormSchema),
    defaultValues: {
      name: 'Test Token',
      refNumber: 5666,
      totalSupply: '1000',
      symbol: 'XY',
    },
  });

  function onSubmit(values: TokenCreateFormSchema) {
    setError(null);
    deployContract({
      abi: ContractArtifacts.abi,
      bytecode: ContractArtifacts.bytecode as Hash,
      args: [values.name, values.symbol, BigInt(values.totalSupply)],
    });
  }

  const { mutate: verifyToken } = useVerifyToken();

  // Track transaction errors
  useEffect(() => {
    if (deployError) {
      setError({
        message: deployError.message || 'Transaction failed. Please try again.',
        type: 'transaction',
      });
    }
  }, [deployError]);

  // Track receipt errors
  useEffect(() => {
    if (isReceiptError && receiptError) {
      setError({
        message: receiptError.message || 'Transaction receipt failed. Please check the transaction.',
        type: 'transaction',
      });
    }
  }, [isReceiptError, receiptError]);

  useEffect(() => {
    if (contractAddress && walletAddress) {
      const formValues = form.getValues();
      const args = [
        formValues.name, // string: "Test Token" → will be quoted in command
        formValues.symbol, // string: "XY" → used as-is
        String(formValues.totalSupply), // number/string → converted to string: "1000"
      ];

      verifyToken(
        {
          contractAddress: contractAddress,
          walletAddress: walletAddress,
          chainId: chainId,
          args: args,
        },
        {
          onSuccess: () => {
            toast.success('Token verification process started');
          },
          onError: (error: any) => {
            setError({
              message: error?.response?.data?.error || error?.message || 'Verification failed. Please try again.',
              type: 'verification',
            });
          },
        }
      );

      form.reset();
    }
  }, [contractAddress, chainId, form, verifyToken, walletAddress]);

  function handleReset() {
    setError(null);
    resetDeploy();
    form.reset({
      name: 'Test Token',
      refNumber: 5666,
      totalSupply: '1000',
      symbol: 'XY',
    });
  }
  return (
    <div className="p-4 md:p-6 flex-1 relative">
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {error ? (
            <ErrorCard error={error} onReset={handleReset} />
          ) : !transactionHash ? (
            <TokenCreateForm form={form} onSubmit={onSubmit} isPending={isDeploying} />
          ) : (
            <div className="space-y-6">
              <TransactionStatusCard txHash={transactionHash} />
              {contractAddress && <ContractVerificationCard contractAddress={contractAddress} />}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
