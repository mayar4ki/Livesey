'use client';

import { useTokenList } from '@acme/client/services/token/useTokenList';
import { getChainUIName } from '@acme/client/utils';
import { Badge } from '@acme/ui/badge';
import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { Skeleton } from '@acme/ui/skeleton';
import { Coins, Newspaper, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Page() {
  const { data, isLoading, error } = useTokenList({ take: 6, skip: 0 });
  const tokens = data?.data ?? [];

  return (
    <div className="space-y-8 p-4 md:p-6">
      <section className="overflow-hidden rounded-xl border bg-linear-to-br from-primary/10 via-background to-muted text-foreground shadow-sm">
        <div className="grid items-start gap-5 p-4 md:p-6 lg:grid-cols-[1fr,0.95fr]">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Live feed
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold leading-tight md:text-2xl">
                Stay ahead with fresh governance updates and new token launches
              </h1>
              <p className="text-sm text-muted-foreground">
                Quick readouts on what&apos;s moving across the network so you can skim, click in, and keep
                working.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm">
                <Link href="/dashboard/token">View token list</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/support">Get support</Link>
              </Button>
            </div>
          </div>

          <Card className="border-border bg-card text-card-foreground shadow-sm">
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Newspaper className="h-4 w-4 text-primary" />
                Platform bulletin
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                A lean feed of the latest changes. Updated automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 -mt-4">
              <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/50 p-3">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wide text-primary">Insight</p>
                  <p className="text-sm font-semibold leading-tight">Fresh token deployments</p>
                  <p className="text-xs text-muted-foreground">
                    Verify operators, view supply, and jump into listings with one click.
                  </p>
                </div>
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                  Live
                </Badge>
              </div>
              <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/50 p-3">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Reminder</p>
                  <p className="text-sm font-semibold leading-tight">Community vote window closing</p>
                  <p className="text-xs text-muted-foreground">
                    Finalize your ballot before the delegation cutoff this evening.
                  </p>
                </div>
                <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground">
                  Due soon
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Latest tokens</h2>
            <p className="text-sm text-muted-foreground">Recently added tokens across all supported chains.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/token">
              View more
              <span className="ml-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                List
              </span>
            </Link>
          </Button>
        </div>

        {error ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
              <Coins className="h-5 w-5 text-destructive" />
              <div>
                <CardTitle className="text-base">Couldn&apos;t load the latest tokens</CardTitle>
                <CardDescription className="text-sm">
                  {error instanceof Error ? error.message : 'Please try again in a moment.'}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <Card key={idx}>
                  <CardHeader className="space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-9 w-32" />
                  </CardContent>
                </Card>
              ))
            ) : tokens.length === 0 ? (
              <Card className="md:col-span-2 xl:col-span-3">
                <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                  <Coins className="h-10 w-10 text-muted-foreground" />
                  <CardTitle className="text-base">No tokens have been added yet</CardTitle>
                  <CardDescription>
                    Deploy a token or check back soon to see newly launched projects.
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              tokens.map((token) => (
                <Card key={token.id} className="flex flex-col">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{token.name}</CardTitle>
                          <Badge variant="outline">{token.symbol}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{getChainUIName(token.chainId)}</p>
                      </div>
                      <Badge variant={token.verifiedAt ? 'default' : 'secondary'}>
                        {token.verifiedAt ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-3">
                    <div className="space-y-1 rounded-lg border bg-muted/40 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Asset info</span>
                        <Badge variant="secondary">Seed data</Badge>
                      </div>
                      <div className="space-y-1">
                        {token.seedData?.data && token.seedData.data.length > 0 ? (
                          token.seedData.data.slice(0, 3).map((entry) => (
                            <div key={entry.key} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{entry.key}</span>
                              <span className="max-w-[60%] truncate font-medium text-foreground">
                                {entry.value}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">No seed data provided yet.</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total supply</span>
                      <span className="font-mono font-medium">
                        {BigInt(token.totalSupply).toLocaleString('en-US')}
                      </span>
                    </div>

                    <div className="mt-auto pt-2">
                      <Button asChild variant="ghost" className="w-full justify-between">
                        <Link href={`/dashboard/token/${token.token}`}>
                          View token
                          <span className="text-muted-foreground">→</span>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
