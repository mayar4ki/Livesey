'use client';

import { type ComponentType, type SVGProps } from 'react';

import { cn } from '@acme/ui';
import { Badge } from '@acme/ui/badge';
import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@acme/ui/form';
import { Input } from '@acme/ui/input';
import { yupResolver } from '@hookform/resolvers/yup';
import { Coins, Search, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { lookupFormSchema, type LookupFormSchema } from './lookupFormSchema';

type LookupType = 'auto' | 'wallet' | 'token' | 'operator' | 'order';

const LOOKUP_TYPES: {
  id: LookupType;
  label: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  //   {
  //     id: 'auto',
  //     label: 'Auto detect',
  //     description: 'Let the app infer the best view from the address format and metadata.',
  //     icon: Sparkles,
  //   },
  {
    id: 'wallet',
    label: 'Wallet / Profile',
    description: 'Regular wallet or smart account that can own assets or place orders.',
    icon: Wallet,
  },
  {
    id: 'token',
    label: 'Token / Asset',
    description: 'ERC-20, ERC-721, or ERC-1155 contract address you want to inspect.',
    icon: Coins,
  },
  {
    id: 'operator',
    label: 'Operator',
    description: 'Approved operator or relayer address involved in settlements.',
    icon: ShieldCheck,
  },
  //   {
  //     id: 'order',
  //     label: 'Order / Strategy',
  //     description: 'Limit order, campaign, or strategy address that manages positions.',
  //     icon: ListChecks,
  //   },
];

export default function Page() {
  const router = useRouter();

  const form = useForm<LookupFormSchema>({
    resolver: yupResolver(lookupFormSchema),
    defaultValues: {
      address: '',
      type: 'wallet',
    },
  });

  const handleSubmit = (data: LookupFormSchema) => {
    if (data.type === 'token') {
      router.push(`/dashboard/token/${data.address}`);
    }

    if (data.type === 'operator') {
      router.push(`/dashboard/operator/${data.address}`);
    }

    if (data.type === 'wallet') {
      router.push(`/dashboard/profile/${data.address}`);
    }
  };

  return (
    <div className="p-4 md:p-6 flex-1">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Look up any address
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mx-4">
              <Sparkles className="h-3.5 w-3.5" />
              Universal lookup
            </div>
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            Search wallets, operators, tokens, orders, and more from a single place. Pick a type or leave it on
            auto and we&apos;ll decide where to send you next.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-xl">Provide an address or identifier</CardTitle>
              <CardDescription>
                Paste any on-chain address or campaign/strategy id. We will categorize it before triggering the
                lookup flow.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="0x..." className="font-mono text-sm" {...field} />
                        </FormControl>
                        <FormDescription>
                          Hex addresses are supported today. If you are unsure about the type, keep it on auto
                          detect.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">What are you looking up?</p>
                          <Badge variant="outline" className="rounded-full">
                            {field.value}
                          </Badge>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {LOOKUP_TYPES.map((option) => {
                            const Icon = option.icon;
                            const isActive = field.value === option.id;

                            return (
                              <button
                                type="button"
                                key={option.id}
                                onClick={() => field.onChange(option.id)}
                                className={cn(
                                  'flex h-full w-full items-start gap-3 rounded-lg border p-3 text-left transition hover:border-primary/60 hover:shadow-sm',
                                  isActive
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-border/70 bg-background'
                                )}
                              >
                                <span
                                  className={cn(
                                    'flex size-10 items-center justify-center rounded-full border text-primary',
                                    isActive ? 'border-primary bg-primary/10' : 'border-border/70 bg-muted/50'
                                  )}
                                >
                                  <Icon className="h-5 w-5" />
                                </span>
                                <span className="space-y-1">
                                  <span className="block text-sm font-medium">{option.label}</span>
                                  <span className="text-xs text-muted-foreground">{option.description}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  />

                  <div className="flex flex-row justify-end items-center gap-2">
                    <Button type="submit" size="lg">
                      <Search className="mr-2 h-4 w-4" />
                      Lookup Address
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
