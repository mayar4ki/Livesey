'use client';

import { Card, CardContent } from '@acme/ui/card';
import { Loader2 } from 'lucide-react';

type LoadingCardProps = {
  message?: string;
  className?: string;
};

/**
 * Reusable loading card component
 */
export function LoadingCard({ message = 'Loading...', className }: LoadingCardProps) {
  return (
    <div className={className || 'p-4 md:p-6 flex-1'}>
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">{message}</span>
        </CardContent>
      </Card>
    </div>
  );
}
