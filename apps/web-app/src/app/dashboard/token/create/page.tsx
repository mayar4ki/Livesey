'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { tokenCreateForm, TokenCreateForm } from '../libs/tokenCreateFormSchema';
import { useDeployContract } from 'wagmi';
import { ContractArtifacts } from '@acme/token-smart-contract';
import { Hash } from 'viem';
import { TokenCreateFormCard } from '../components/TokenCreateFormCard';
import { TransactionStatusCard } from '../components/TransactionStatusCard';
import { ContractVerificationCard } from '../components/ContractVerificationCard';
import { AnimatePresence, motion } from 'motion/react';
import { useWaitForTransactionReceipt } from 'wagmi';

export default function Page() {
  const form = useForm<TokenCreateForm>({
    resolver: yupResolver(tokenCreateForm),
    defaultValues: {
      name: 'Test Token',
      refNumber: 5666,
      totalSupply: '1000',
      symbol: 'XY',
    },
  });

  const { deployContract, isPending, data: deployTxHash } = useDeployContract();

  const { data: receipt } = useWaitForTransactionReceipt({
    hash: deployTxHash,
    query: {
      enabled: !!deployTxHash,
    },
  });

  const contractAddress = receipt?.contractAddress;

  async function onSubmit(values: TokenCreateForm) {
    deployContract({
      abi: ContractArtifacts.abi,
      bytecode: ContractArtifacts.bytecode as Hash,
      args: [values.name, values.symbol, BigInt(values.totalSupply)],
    });
  }

  return (
    <div className="p-4 md:p-6 flex-1 relative">
      <AnimatePresence mode="wait">
        {deployTxHash ? (
          <motion.div
            key="transaction-status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-4"
          >
            <TransactionStatusCard txHash={deployTxHash} />
            {contractAddress && (
              <ContractVerificationCard contractAddress={contractAddress} />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <TokenCreateFormCard form={form} onSubmit={onSubmit} isPending={isPending} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
