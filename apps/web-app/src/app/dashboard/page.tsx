'use client';

import { LimitOrderType, type LimitOrder } from '@acme/client/services/limit-order/useCreateLimitOrder';
import { useLimitOrders } from '@acme/client/services/limit-order/useLimitOrders';
import { useTrendingTokens } from '@acme/client/services/token/useTrendingTokens';
import { formatDateTime, getChainUIName } from '@acme/client/utils';
import { Badge } from '@acme/ui/badge';
import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { Skeleton } from '@acme/ui/skeleton';
import { ArrowRight, ArrowRightLeft, Flame, LineChart, Sparkles, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import type { ComponentType } from 'react';
import { useMemo } from 'react';
import { useGetOrderTokensInfo } from '../../_hooks/useGetOrderTokensInfo';

/**
 *
 * TODO: make apis for to get proper data for the dashboard and display it here
 */
function DashboardPage() {
  const { data: trendingData, isLoading: tokensLoading, error: tokensError } = useTrendingTokens({ take: 8 });
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useLimitOrders({
    take: 8,
    status: 'pending',
  });

  const tokens = trendingData?.data ?? [];
  const orders = ordersData?.data ?? [];

  const getOrderTokensInfo = useGetOrderTokensInfo();

  const stats = useMemo(() => {
    const totalOrders = ordersData?.pagination?.total ?? 0;
    const totalTokens = trendingData?.pagination?.total ?? tokens.length;
    const buy = orders.filter((order) => order.type === LimitOrderType.BUY).length;
    const sell = orders.filter((order) => order.type === LimitOrderType.SELL).length;
    const activeChains = new Set([
      ...orders.map((order) => order.chainId),
      ...tokens.map((token) => token.chainId),
    ]).size;
    const freshTokens = tokens.filter((token) => {
      const createdAt = new Date(token.createdAt).getTime();
      const threeDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 3;
      return createdAt > threeDaysAgo;
    }).length;

    return {
      totalOrders,
      totalTokens,
      buy,
      sell,
      activeChains,
      freshTokens,
    };
  }, [orders, ordersData?.pagination?.total, tokens, trendingData?.pagination?.total]);

  const heroOrders = useMemo(() => orders.slice(0, 4), [orders]);

  const momentumPairs = useMemo(() => {
    const pairs = new Map<string, { pair: string; chainId: number; count: number; lastPrice: number | null }>();

    orders.forEach((order) => {
      const { makeTokenInfo, takeTokenInfo, _price } = getOrderTokensInfo(order);
      const make = makeTokenInfo?.symbol ?? '???';
      const take = takeTokenInfo?.symbol ?? '???';
      const key = `${make}/${take}-${order.chainId}`;
      const existing = pairs.get(key);

      pairs.set(key, {
        pair: `${make}/${take}`,
        chainId: order.chainId,
        count: (existing?.count ?? 0) + 1,
        lastPrice: _price ?? existing?.lastPrice ?? null,
      });
    });

    return Array.from(pairs.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [getOrderTokensInfo, orders]);

  const tickerItems = useMemo(() => {
    const tokenItems = tokens.slice(0, 6).map((token) => ({
      id: token.id,
      label: token.symbol,
      desc: `${getChainUIName(token.chainId)} · supply ${safeFormatSupply(token.totalSupply)}`,
      href: `/dashboard/token/${token.token}`,
    }));

    const pairItems = momentumPairs.map((pair) => ({
      id: `${pair.pair}-${pair.chainId}`,
      label: pair.pair,
      desc: `${pair.count} orders · ${getChainUIName(pair.chainId)}`,
      href: '/dashboard/limit-order',
    }));

    return [...pairItems, ...tokenItems];
  }, [momentumPairs, tokens]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <section className="relative overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-10 top-0 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute right-10 top-10 h-36 w-36 rounded-full bg-emerald-500/10 blur-2xl" />
          <div className="absolute bottom-0 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-foreground/10 blur-2xl" />
        </div>

        <div className="relative grid gap-6 p-6 md:grid-cols-[1.5fr,1fr] md:p-8">
          <div className="space-y-6">
            <Badge variant="outline" className="gap-2 rounded-full px-4 py-1 text-sm">
              <Flame className="h-4 w-4 text-orange-500" />
              Live momentum board
            </Badge>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Track order flow, spot fresh mints, and dive straight into action.
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg">
                One canvas for price makers and token hunters. Follow where liquidity clusters and what’s launching
                right now.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/dashboard/limit-order" className="gap-2">
                  Open orderbook
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard/token" className="gap-2">
                  Browse tokens
                  <Sparkles className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Chip icon={ArrowRightLeft} label="Open orders" value={stats.totalOrders.toLocaleString()} />
              <Chip icon={TrendingUp} label="Fresh mints (72h)" value={stats.freshTokens} />
              <Chip icon={LineChart} label="Buy vs Sell" value={`${stats.buy}:${stats.sell || 0}`} />
              <Chip icon={Zap} label="Active chains" value={stats.activeChains || 0} />
            </div>
          </div>

          <div className="grid gap-3">
            <Card className="border shadow-sm">
              <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ArrowRightLeft className="h-4 w-4" />
                    Most active pairs
                  </CardTitle>
                  <CardDescription>Where orders are clustering right now.</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {ordersLoading ? (
                    <Skeleton className="h-10 w-full max-w-xl" />
                  ) : heroOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No live orders yet—be the first to place one.</p>
                  ) : (
                    heroOrders.map((order) => {
                      const { makeTokenInfo, takeTokenInfo, _price } = getOrderTokensInfo(order);
                      return (
                        <div
                          key={order.id}
                          className="flex items-center gap-3 rounded-full border bg-background/70 px-4 py-2 backdrop-blur"
                        >
                          <Badge
                            className={
                              order.type === LimitOrderType.SELL
                                ? 'bg-red-500 text-white hover:bg-red-500'
                                : 'bg-emerald-500 text-white hover:bg-emerald-500'
                            }
                          >
                            {order.type}
                          </Badge>
                          <div className="flex flex-col leading-tight">
                            <span className="text-sm font-semibold">
                              {makeTokenInfo?.symbol ?? '???'} / {takeTokenInfo?.symbol ?? '???'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {_price ? `~ ${_price}` : '•'} · {getChainUIName(order.chainId)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="relative px-6 pb-6 md:px-8 space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Trending tokens
          </div>
          <Marquee>
            {tickerItems.length === 0 ? (
              <TickerPill label="Waiting for activity" desc="New tokens and pairs will show up here" />
            ) : (
              tickerItems.map((item) => (
                <TickerPill key={item.id} label={item.label} desc={item.desc} href={item.href} />
              ))
            )}
          </Marquee>
        </div>
        <div className="px-6 pb-6">
          <RollingOrders orders={orders} loading={ordersLoading} error={ordersError} />
        </div>
      </section>
    </div>
  );
}

function Chip({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-sm shadow-sm backdrop-blur">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function Marquee({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-background/70 shadow-inner">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-background via-background/70 to-transparent" />
      <div className="flex min-w-full gap-3 py-3 text-sm [animation:marquee_26s_linear_infinite] group-hover:[animation-play-state:paused]">
        {children}
        {children}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

function TickerPill({ label, desc, href }: { label: string; desc: string; href?: string }) {
  const content = (
    <div className="flex min-w-max items-center gap-2 rounded-full border bg-card/80 px-3 py-1.5 shadow-sm">
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-xs text-muted-foreground">{desc}</span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:border-primary hover:bg-primary/5">
        {content}
      </Link>
    );
  }

  return content;
}

function safeFormatSupply(totalSupply: string) {
  try {
    return BigInt(totalSupply).toLocaleString('en-US');
  } catch {
    return totalSupply;
  }
}

function RollingOrders({ orders, loading, error }: { orders: LimitOrder[]; loading: boolean; error: unknown }) {
  const getOrderTokensInfo = useGetOrderTokensInfo();
  const items = (orders ?? []).slice(0, 8);

  return (
    <Card className=" shadow-sm overflow-hidden">
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowRightLeft className="h-5 w-5" />
            Order pulse
          </CardTitle>
          <CardDescription>Latest orders as a moving stream.</CardDescription>
        </div>
        <Button asChild variant="secondary" size="sm" className="gap-2">
          <Link href="/dashboard/limit-order">
            See full book
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="rounded-lg border border-dashed bg-destructive/5 p-4 text-sm text-destructive">
            Failed to load limit orders. Please try again.
          </div>
        ) : loading ? (
          <div className="flex gap-3 overflow-hidden">
            <Skeleton className="h-24 w-60 rounded-xl" />
            <Skeleton className="h-24 w-60 rounded-xl" />
            <Skeleton className="h-24 w-60 rounded-xl" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <ArrowRightLeft className="h-10 w-10 text-muted-foreground" />
            <p className="text-base font-semibold">No open orders right now</p>
            <p className="text-sm text-muted-foreground">Place the first one and watch it appear instantly.</p>
          </div>
        ) : (
          <div className="group relative overflow-hidden rounded-2xl border bg-background/70 px-2 py-3">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-background via-background/80 to-transparent" />
            <div className="flex min-w-full gap-3 py-1 [animation:marqueeCards_30s_linear_infinite] group-hover:[animation-play-state:paused]">
              {[...items, ...items].map((order, idx) => {
                const { makeTokenInfo, takeTokenInfo, _price } = getOrderTokensInfo(order as any);
                return (
                  <div
                    key={(order as any).id + '-' + idx}
                    className="flex min-w-[240px] flex-col gap-2 rounded-xl border bg-card/90 px-3 py-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <Badge
                        className={
                          (order as any).type === LimitOrderType.SELL
                            ? 'bg-red-500 text-white hover:bg-red-500'
                            : 'bg-emerald-500 text-white hover:bg-emerald-500'
                        }
                      >
                        {(order as any).type}
                      </Badge>
                      <Badge variant="outline" className="text-[11px]">
                        {getChainUIName((order as any).chainId)}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">
                        {makeTokenInfo?.symbol ?? '???'} / {takeTokenInfo?.symbol ?? '???'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {_price ? `~ ${_price}` : '•'} · exp{' '}
                        {formatDateTime(new Date(Number((order as any).expiration) * 1000))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border bg-background/60 px-2 py-1.5 text-xs">
                      <span className="text-muted-foreground">Maker</span>
                      <span className="font-mono">{(order as any).maker.slice(0, 6)}…</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <style jsx>{`
              @keyframes marqueeCards {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-50%);
                }
              }
            `}</style>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Page() {
  return (
    <div>
      dashboard
      {/* <DashboardPage /> */}
    </div>
  );
}
