'use client';

import { useAccount } from 'wagmi';

import { useOperatorDetails } from '@acme/client/services/operator/useOperatorDetails';
import { useTokenList } from '@acme/client/services/token/useTokenList';
import { getChainUIName } from '@acme/client/utils';
import { Badge } from '@acme/ui/badge';
import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { ArrowUpRight, BarChart3, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Address } from 'viem';

export default function Page() {
  const { address } = useAccount();
  const { data: operator } = useOperatorDetails(address);

  const { data: tokenData } = useTokenList({
    take: 1,
    skip: 0,
    operator: address as Address,
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
        <Card className="border-dashed bg-muted/40">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                Operator dashboard
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  Active
                </Badge>
              </CardTitle>
              <CardDescription>Overview of tokens you operate along with verification and data coverage.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild size="sm">
                <Link href="/token">
                  View tokens
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Operator</p>
              <p className="text-lg font-semibold">{operator?.data?.name ?? 'Unnamed operator'}</p>
              <p className="text-xs text-muted-foreground break-all">{address}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Chain</p>
                <p className="font-medium">{operator?.data?.chainId ? getChainUIName(operator.data.chainId) : '—'}</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-medium">{operator?.data?.isPaused ? 'Paused' : 'Active'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Operated tokens
            </CardTitle>
            <CardDescription>Snapshot of your token footprint.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs text-muted-foreground">Total tokens</p>
              <p className={`text-2xl font-semibold`}>{tokenData?.pagination?.total?.toLocaleString() ?? '0'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
