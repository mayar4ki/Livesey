'use client';

import { useQueryParams } from '@acme/client/hooks';

import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@acme/ui/tabs';
import { ArrowLeftRight, Coins } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Address } from 'viem';
import { useChainId } from 'wagmi';
import { AddressOrdersCard } from './_components/AddressOrdersCard';
import { AssetsCard } from './_components/AssetsCard';

type TabValue = 'assets' | 'orders';

export default function LookupAddressPage() {
  const params = useParams();
  const address = params.address as Address;

  const chainId = useChainId();

  const { params: queryParams, setParams } = useQueryParams({ tab: 'assets' as TabValue });

  const handleTabChange = (value: string) => {
    setParams({ tab: value as TabValue });
  };

  return (
    <div className="p-4 md:p-6 flex-1">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center">
          <h1 className="text-lg font-medium">Profile</h1>
          <ExplorerLink
            hash={address}
            chainId={chainId}
            showFull
            type="address"
            className=" bg-transparent hover:underline text-muted-foreground"
          />
        </div>

        {/* Tabs */}
        <Tabs value={queryParams.tab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-fit">
            <TabsTrigger value="assets" className="gap-1.5 text-sm">
              <Coins className="h-3.5 w-3.5" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5 text-sm">
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="mt-4">
            <AssetsCard address={address} />
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            <AddressOrdersCard address={address} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
