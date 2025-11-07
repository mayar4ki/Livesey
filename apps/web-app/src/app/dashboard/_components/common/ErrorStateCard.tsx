'use client';

import { Card, CardContent } from '@acme/ui/card';
import { LucideIcon } from 'lucide-react';

type ErrorStateCardProps = {
  icon?: LucideIcon;
  title?: string;
  message: string;
  className?: string;
};

/**
 * Reusable error state card component
 */
export function ErrorStateCard({ icon: Icon, title = 'Error', message, className }: ErrorStateCardProps) {
  return (
    <div className={className || 'p-4 md:p-6 flex-1'}>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          {Icon && <Icon className="h-12 w-12 text-destructive mb-4" />}
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
