'use client';

import { formatAddress } from '@acme/client/utils';
import { useQueryParams } from '@acme/client/hooks';
import { DataTablePagination } from '@acme/ui/bootstrapped/data-table-pagination';
import { ErrorStateCard } from '@acme/ui/bootstrapped/error-state-card';
import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { Shield } from 'lucide-react';
import { Address } from 'viem';
import { TokensTable } from '~/app/dashboard/token/_components/TokensTable';
import { useTokensList } from '~/services/token/useTokensList';

export const OperatedTokensCard = ({ address }: { address: Address }) => {
  const { params, setParams } = useQueryParams({ operatedTake: 10, operatedSkip: 0 });

  const { data, isLoading, error } = useTokensList({
    skip: params.operatedSkip,
    take: params.operatedTake,
    operator: address,
  });

  const tokens = data?.data || [];

  if (error) {
    return (
      <ErrorStateCard
        icon={Shield}
        title="Error Loading Operated Tokens"
        message={error instanceof Error ? error.message : 'Failed to load operated tokens'}
      />
    );
  }

  if (isLoading) {
    return <LoadingCard message={`Loading operated tokens for ${formatAddress(address)}...`} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Operated Tokens
        </CardTitle>
        <CardDescription>Tokens operated by {formatAddress(address)}</CardDescription>
      </CardHeader>
      <CardContent>
        {tokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Operated Tokens</h3>
            <p className="text-sm text-muted-foreground text-center">
              We couldn't find any tokens operated by this address yet.
            </p>
          </div>
        ) : (
          <>
            <TokensTable tokens={tokens} />
            <DataTablePagination
              currentPage={Math.floor(params.operatedSkip / params.operatedTake) + 1}
              totalPages={
                data?.pagination?.total
                  ? Math.ceil(data?.pagination?.total / data?.pagination?.take)
                  : 0
              }
              onPageChange={(page: number) => {
                setParams({
                  operatedSkip: (page - 1) * params.operatedTake,
                  operatedTake: params.operatedTake,
                });
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
