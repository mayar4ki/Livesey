'use client';

import { Badge } from '@acme/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';

type Trade = {
  id: string;
  type: 'buy' | 'sell';
  amount: string;
  price: string;
  total: string;
  timestamp: string;
  trader: string;
};

// Mock data - replace with actual data
const mockTrades: Trade[] = [
  {
    id: '1',
    type: 'buy',
    amount: '100.00',
    price: '0.05',
    total: '5.00',
    timestamp: '2 minutes ago',
    trader: '0x1234...5678',
  },
  {
    id: '2',
    type: 'sell',
    amount: '50.00',
    price: '0.048',
    total: '2.40',
    timestamp: '5 minutes ago',
    trader: '0xabcd...efgh',
  },
];

export function TradesListCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
            <div>Type</div>
            <div>Amount</div>
            <div>Price</div>
            <div>Total</div>
            <div>Time</div>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {mockTrades.map((trade) => (
              <div key={trade.id} className="grid grid-cols-5 gap-4 text-sm items-center">
                <div>
                  <Badge variant={trade.type === 'buy' ? 'default' : 'destructive'} className="flex items-center gap-1 w-fit">
                    {trade.type === 'buy' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {trade.type.toUpperCase()}
                  </Badge>
                </div>
                <div className="font-mono">{trade.amount}</div>
                <div className="font-mono">{trade.price}</div>
                <div className="font-mono">{trade.total}</div>
                <div className="text-muted-foreground">{trade.timestamp}</div>
              </div>
            ))}
          </div>
          {mockTrades.length === 0 && <div className="text-center py-8 text-muted-foreground">No trades yet</div>}
        </div>
      </CardContent>
    </Card>
  );
}
