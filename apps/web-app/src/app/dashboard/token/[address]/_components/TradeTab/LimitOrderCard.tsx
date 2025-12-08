'use client';

import { Token } from '@acme/client/services/token/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { LimitOrderForm } from './LimitOrderForm/LimitOrderForm';

export interface LimitOrderCardProps {
  token: Token;
  className?: string;
}

export function LimitOrderCard({ token, className }: LimitOrderCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Limit Order</CardTitle>
        <CardDescription>Buy or sell tokens at a specific price.</CardDescription>
      </CardHeader>
      <CardContent>
        <LimitOrderForm token={token} />
      </CardContent>
    </Card>
  );
}
