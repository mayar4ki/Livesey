'use client';

import { Badge } from '@acme/ui/badge';
import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { Wallet } from 'lucide-react';

type Holder = {
  address: string;
  balance: string;
  percentage: number;
  rank: number;
};

// Mock data - replace with actual data
const mockHolders: Holder[] = [
  {
    address: '0x1234567890123456789012345678901234567890',
    balance: '1000000.00',
    percentage: 45.5,
    rank: 1,
  },
  {
    address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    balance: '500000.00',
    percentage: 22.7,
    rank: 2,
  },
  {
    address: '0x9876543210987654321098765432109876543210',
    balance: '250000.00',
    percentage: 11.4,
    rank: 3,
  },
];

export function HoldersListCard({ chainId }: { chainId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Top Holders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
            <div>Rank</div>
            <div>Address</div>
            <div>Balance</div>
            <div>Percentage</div>
          </div>
          <div className="space-y-3  overflow-y-auto min-h-[300px]">
            {mockHolders.map((holder) => (
              <div key={holder.address} className="grid grid-cols-4 gap-4 text-sm items-center">
                <div>
                  <Badge variant="outline">#{holder.rank}</Badge>
                </div>
                <div>
                  <ExplorerLink hash={holder.address as `0x${string}`} chainId={parseInt(chainId, 10)} />
                </div>
                <div className="font-mono">{holder.balance}</div>
                <div className="text-muted-foreground">{holder.percentage.toFixed(2)}%</div>
              </div>
            ))}
          </div>
          {mockHolders.length === 0 && <div className="text-center py-8 text-muted-foreground">No holders found</div>}
        </div>
      </CardContent>
    </Card>
  );
}
