'use client';

import { formatDateTime, getChainUIName, getExplorerUrl } from '@acme/shared/utils';
import { Badge } from '@acme/ui/badge';
import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { ArrowLeft, Coins, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ErrorStateCard } from '~/_components/common/ErrorStateCard';
import { ExplorerAddressLink } from '~/_components/common/ExplorerAddressLink';
import { LoadingCard } from '~/_components/common/LoadingCard';
import { useToken } from '~/services/token/useToken';

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
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{token.name}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-base px-3 py-1">
                      {token.symbol}
                    </Badge>
                    <Badge variant="secondary">{getChainUIName(token.chainId)}</Badge>
                  </div>
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <a
                  href={getExplorerUrl(token.transactionHash as `0x${string}`, token.chainId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  View on Explorer
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Token Details Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Token Name</label>
                <p className="text-base font-medium mt-1">{token.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Symbol</label>
                <p className="text-base font-medium mt-1">
                  <Badge variant="outline">{token.symbol}</Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Supply</label>
                <p className="text-base font-mono mt-1">{BigInt(token.totalSupply).toLocaleString('en-US')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Chain</label>
                <p className="text-base mt-1">
                  <Badge variant="secondary">{getChainUIName(token.chainId)}</Badge>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contract Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contract Address</label>
                <div className="mt-1">
                  <ExplorerAddressLink address={token.contractAddress} chainId={token.chainId} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Deployer Address</label>
                <div className="mt-1">
                  <ExplorerAddressLink address={token.deployerAddress} chainId={token.chainId} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
                <div className="mt-1">
                  <a
                    href={getExplorerUrl(token.transactionHash as `0x${string}`, token.chainId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono bg-muted px-2 py-1 rounded hover:bg-muted/80 cursor-pointer transition-colors inline-block"
                  >
                    {token.transactionHash.slice(0, 10)}...{token.transactionHash.slice(-8)}
                  </a>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Block Number</label>
                <p className="text-base font-mono mt-1">{BigInt(token.blockNumber).toLocaleString('en-US')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Deployment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Deployment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Deployed At</label>
                <p className="text-base mt-1">{formatDateTime(token.deployedAt)}</p>
              </div>
              {token.verifiedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Verified At</label>
                  <p className="text-base mt-1">{formatDateTime(token.verifiedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Token ID</label>
                <p className="text-base font-mono mt-1 break-all">{token.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="text-base mt-1">{formatDateTime(token.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-base mt-1">{formatDateTime(token.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
