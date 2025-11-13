'use client';

import { ErrorStateCard } from '@acme/ui/bootstrapped/error-state-card';
import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { Button } from '@acme/ui/button';
import { ArrowLeft, Coins } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useToken } from '~/services/token/useToken';
import { TokenBasicInfoCard } from './_components/TokenBasicInfoCard';
import { TokenContractInfoCard } from './_components/TokenContractInfoCard';
import { TokenDeploymentInfoCard } from './_components/TokenDeploymentInfoCard';
import { TokenHeaderCard } from './_components/TokenHeaderCard';
import { TokenMetadataCard } from './_components/TokenMetadataCard';

export default function Page() {
  const params = useParams();
  const tokenId = params.id as string;
  const { data, isLoading, error } = useToken(tokenId);
  const token = data?.data;

  if (isLoading) {
    return <LoadingCard message="Loading token details..." />;
  }

  if (error) {
    return (
      <ErrorStateCard
        icon={Coins}
        title="Error Loading Token"
        message={error instanceof Error ? error.message : 'Failed to load token details'}
        action={
          <Button asChild variant="outline">
            <Link href="/token">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Token List
            </Link>
          </Button>
        }
      />
    );
  }

  if (!token) {
    return (
      <ErrorStateCard
        icon={Coins}
        title="Token Not Found"
        message="The token you're looking for doesn't exist."
        action={
          <Button asChild variant="outline">
            <Link href="/token">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Token List
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="p-4 md:p-6 flex-1">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/token">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Token List
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <TokenHeaderCard token={token} />

        <div className="grid gap-6 md:grid-cols-2">
          <TokenBasicInfoCard token={token} />
          <TokenContractInfoCard token={token} />
          <TokenDeploymentInfoCard token={token} />
          <TokenMetadataCard token={token} />
        </div>
      </div>
    </div>
  );
}
