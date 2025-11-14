'use client';

import { useQueryParams } from '@acme/shared/hooks';
import { ErrorStateCard } from '@acme/ui/bootstrapped/error-state-card';
import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { Card, CardContent } from '@acme/ui/card';
import { Coins } from 'lucide-react';
import { useMemo } from 'react';
import { TokenViewToggle } from '~/app/dashboard/_components/TokenViewToggle';
import { TokensTable } from '~/app/dashboard/_components/TokensTable';
import { useTrendingTokens } from '~/services/token/useTrendingTokens';

type ViewType = 'trending' | 'new';

export default function Page() {
  const { data, isLoading, error } = useTrendingTokens({ take: 15 });
  const allTokens = data?.data || [];

  const { params } = useQueryParams({ view: 'trending' });
  const viewType = (params.view as ViewType) || 'trending';

  // Filter tokens based on view type
  const tokens = useMemo(() => {
    if (viewType === 'new') {
      // Sort by deployedAt (most recent first)
      return [...allTokens].sort((a, b) => {
        const dateA = new Date(a.deployedAt).getTime();
        const dateB = new Date(b.deployedAt).getTime();
        return dateB - dateA;
      });
    }
    // For trending, return as-is (or implement trending logic later)
    return allTokens;
  }, [allTokens, viewType]);

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <ErrorStateCard
          icon={Coins}
          title="Error Loading Tokens"
          message={error instanceof Error ? error.message : 'Failed to load trending tokens'}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <LoadingCard message="Loading trending tokens..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 flex-1">
      <TokenViewToggle />
      <Card className=" mt-4 ">
        <CardContent className=" p-0">
          {tokens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Coins className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tokens Found</h3>
              <p className="text-sm text-muted-foreground text-center">
                No {viewType === 'trending' ? 'trending' : 'new'} tokens available at the moment.
              </p>
            </div>
          ) : (
            <TokensTable tokens={tokens} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
