'use client';

import { ERC20ImplementationAbi } from '@acme/smart-contract';
import { ErrorStateCard } from '@acme/ui/bootstrapped/error-state-card';
import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { Button } from '@acme/ui/button';
import { ArrowLeft, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { addTokenToWallet } from '~/_helpers/addTokenToWallet';
import { useToken } from '~/services/token/useToken';
import { TokenBasicInfoCard } from './_components/TokenBasicInfoCard';
import { TokenContractInfoCard } from './_components/TokenContractInfoCard';
import { TokenDeploymentInfoCard } from './_components/TokenDeploymentInfoCard';
import { TokenHeaderCard } from './_components/TokenHeaderCard';
import { TokenMetadataCard } from './_components/TokenMetadataCard';

export default function TokenPage() {
  const params = useParams();
  const chainId = params.chainId as string;
  const address = params.address as string;

  const { data: tokenResponse, isLoading, error } = useToken(chainId, address);
  const token = tokenResponse?.data;

  // Read decimals from the contract
  const { data: decimals, isLoading: isLoadingDecimals } = useReadContract({
    address: address as Address,
    abi: ERC20ImplementationAbi,
    functionName: 'decimals',
    chainId: parseInt(chainId, 10),
  });

  const handleAddToWallet = () => {
    if (!token) return;

    addTokenToWallet({
      address: token.contractAddress,
      symbol: token.symbol,
      decimals: decimals !== undefined ? Number(decimals) : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <LoadingCard message="Loading token information..." />
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <ErrorStateCard icon={Wallet} title="Token Not Found" message={error instanceof Error ? error.message : 'Failed to load token information'} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 flex-1">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <TokenHeaderCard token={token} onAddToWallet={handleAddToWallet} isAddingToWallet={isLoadingDecimals || decimals === undefined} />

        <div className="grid gap-6 md:grid-cols-2">
          <TokenBasicInfoCard token={token} decimals={decimals} isLoadingDecimals={isLoadingDecimals} />
          <TokenContractInfoCard token={token} />
          <TokenDeploymentInfoCard token={token} />
          <TokenMetadataCard token={token} />
        </div>
      </div>
    </div>
  );
}
