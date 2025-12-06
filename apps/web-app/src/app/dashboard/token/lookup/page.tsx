'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@acme/ui/form';
import { Input } from '@acme/ui/input';
import { Info, Search, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useChainId } from 'wagmi';
import { ADDRESS as FACTORY_ADDRESS } from '~/_config/smart-contracts/Factory/address';
import { tokenLookupFormSchema, type TokenLookupFormSchema } from './lookupFormSchema';

export default function TokenLookupPage() {
  const router = useRouter();
  const chainId = useChainId();

  const form = useForm<TokenLookupFormSchema>({
    resolver: yupResolver(tokenLookupFormSchema),
    defaultValues: {
      address: '',
    },
  });

  const handleSubmit = (data: TokenLookupFormSchema) => {
    router.push(`/dashboard/token/${data.address}`);
  };

  return (
    <div className="p-4 md:p-6 flex-1">
      <div className="max-w-2xl mx-auto">
        <Card className="mt-4">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Token Lookup</CardTitle>
            <CardDescription className="text-base">
              Enter a token contract address to view its details, trading, and governance info.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Contract Address</FormLabel>
                      <FormControl>
                        <Input placeholder="0x..." className="font-mono text-sm" {...field} />
                      </FormControl>
                      <FormDescription>Use the full token address created from the factory.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                  <Search className="h-4 w-4 mr-2" />
                  Lookup Token
                </Button>
              </form>
            </Form>

            <div className="mt-6 rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-foreground font-medium">Need to find a token address?</p>
                  <p>
                    You can locate tokens minted by the factory contract directly in the block explorer. Open the
                    factory contract, browse its events, and copy the token address from the latest creation entry.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-foreground font-medium">Factory contract:</span>
                    <ExplorerLink
                      hash={FACTORY_ADDRESS}
                      chainId={chainId}
                      showFull
                      type="address"
                      className="bg-primary/5 text-foreground"
                    />
                  </div>
                  <ul className="list-decimal space-y-1 pl-5">
                    <li>Open the factory contract above in the explorer.</li>
                    <li>Go to the Logs/Events tab and look for token creation events.</li>
                    <li>Copy the emitted token address and paste it into the field above.</li>
                  </ul>
                  <p className="text-foreground">
                    You can also cross-check the token status in the token ledger to confirm whether it is active or
                    paused before interacting with it.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
