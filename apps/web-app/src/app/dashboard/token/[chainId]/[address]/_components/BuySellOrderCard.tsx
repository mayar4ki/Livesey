'use client';

import { Button } from '@acme/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { Input } from '@acme/ui/input';
import { Label } from '@acme/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@acme/ui/tabs';
import { ArrowDown, ArrowUp } from 'lucide-react';

export function BuySellOrderCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Place Order</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4" />
              Sell
            </TabsTrigger>
          </TabsList>
          <TabsContent value="buy" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="buy-amount">Amount</Label>
              <Input id="buy-amount" type="number" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buy-price">Price per Token</Label>
              <Input id="buy-price" type="number" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buy-total">Total</Label>
              <Input id="buy-total" type="number" placeholder="0.00" readOnly />
            </div>
            <Button className="w-full" variant="default">
              Place Buy Order
            </Button>
          </TabsContent>
          <TabsContent value="sell" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="sell-amount">Amount</Label>
              <Input id="sell-amount" type="number" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sell-price">Price per Token</Label>
              <Input id="sell-price" type="number" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sell-total">Total</Label>
              <Input id="sell-total" type="number" placeholder="0.00" readOnly />
            </div>
            <Button className="w-full" variant="destructive">
              Place Sell Order
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

