'use client';

import { motion, AnimatePresence } from 'motion/react';
import { TokenCreateForm } from '../_components/TokenCreateForm';

import { TransactionStatusCard } from '../_components/TransactionStatusCard';
import { ContractVerificationCard } from '../_components/ContractVerificationCard';
import { useChainId, useDeployContract, useWaitForTransactionReceipt } from 'wagmi';
import { ContractArtifacts } from '@acme/token-smart-contract';
import { Address, Hash } from 'viem';
import { tokenCreateFormSchema, TokenCreateFormSchema } from '../_libs/tokenCreateFormSchema';
import { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useVerifyToken } from '@/hooks/useVerifyToken';
import { toast } from 'sonner';

export default function Page() {
  const { deployContract, isPending: isDeploying, data: transactionHash } = useDeployContract({});

  const chainId = useChainId();
  // Get transaction receipt to extract contract address
  const { data: receipt } = useWaitForTransactionReceipt({
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
    deployContract({
      abi: ContractArtifacts.abi,
      bytecode: ContractArtifacts.bytecode as Hash,
      args: [values.name, values.symbol, BigInt(values.totalSupply)],
    });
  }

  const { mutate: verifyToken } = useVerifyToken();

  useEffect(() => {
    if (contractAddress) {
      const formValues = form.getValues();
      const args = [
        formValues.name, // string: "Test Token" → will be quoted in command
        formValues.symbol, // string: "XY" → used as-is
        String(formValues.totalSupply), // number/string → converted to string: "1000"
      ];

      verifyToken(
        {
          contractAddress: contractAddress as Address,
          chainId: chainId,
          args: args,
        },
        {
          onSuccess: () => {
            toast.success('Token verification process started');
          },
        }
      );

      form.reset();
    }
  }, [contractAddress, chainId, form, verifyToken]);
  return (
    <div className="p-4 md:p-6 flex-1 relative">
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {!transactionHash ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <TokenCreateForm form={form} onSubmit={onSubmit} isPending={isDeploying} />
            </motion.div>
          ) : (
            <motion.div
              key="status"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="space-y-6"
            >
              <TransactionStatusCard txHash={transactionHash} />
              {contractAddress && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.2,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <ContractVerificationCard contractAddress={contractAddress} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
