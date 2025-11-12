'use client';

import { Card, CardContent } from '@acme/ui/card';
import { Wrench } from 'lucide-react';

export default function Page() {
  return (
    <div className="p-4 md:p-6 flex-1">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Under Maintenance</h3>
          <p className="text-sm text-muted-foreground text-center">This page is currently under maintenance. Please check back later.</p>
        </CardContent>
      </Card>
    </div>
  );
}
