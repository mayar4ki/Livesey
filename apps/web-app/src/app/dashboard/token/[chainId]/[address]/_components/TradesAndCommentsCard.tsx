'use client';

import { Badge } from '@acme/ui/badge';
import { Button } from '@acme/ui/button';
import { Card, CardContent } from '@acme/ui/card';
import { Input } from '@acme/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@acme/ui/tabs';
import { ArrowDown, ArrowUp, MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';

type Trade = {
  id: string;
  type: 'buy' | 'sell';
  amount: string;
  price: string;
  total: string;
  timestamp: string;
  trader: string;
};

type Comment = {
  id: string;
  author: string;
  content: string;
  timestamp: string;
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

// Mock data - replace with actual data
const mockComments: Comment[] = [
  {
    id: '1',
    author: '0x1234...5678',
    content: 'Great token! Looking forward to seeing it grow.',
    timestamp: '1 hour ago',
  },
  {
    id: '2',
    author: '0xabcd...efgh',
    content: 'Just bought some, excited about the project!',
    timestamp: '2 hours ago',
  },
];

export function TradesAndCommentsCard() {
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic will be implemented later
    console.log('Comment:', comment);
    setComment('');
  };

  return (
    <Card>
      <CardContent>
        <Tabs defaultValue="trades" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments
            </TabsTrigger>
          </TabsList>

          {/* Trades Tab */}
          <TabsContent value="trades" className="mt-4">
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
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="mt-4">
            <div className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-2">
                <Input placeholder="Write a comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
                <Button type="submit" size="sm" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </Button>
              </form>

              <div className="space-y-4 mt-6 max-h-[500px] overflow-y-auto">
                {mockComments.map((comment) => (
                  <div key={comment.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-sm">{comment.author}</div>
                      <div className="text-xs text-muted-foreground">{comment.timestamp}</div>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                ))}
                {mockComments.length === 0 && <div className="text-center py-8 text-muted-foreground">No comments yet. Be the first to comment!</div>}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
