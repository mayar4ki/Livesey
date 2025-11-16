'use client';

import { useQueryParams } from '@acme/client/hooks';
import { cn } from '@acme/ui';
import { Button } from '@acme/ui/button';
import { siteName } from '@acme/white-label/web-app';
import { Flame, Sparkles } from 'lucide-react';

type ViewType = 'trending' | 'new';

export function TokenViewToggle() {
  const { params, setParams } = useQueryParams({ view: 'trending' });
  const viewType = (params.view as ViewType) || 'trending';

  return (
    <div className="mb-2 ">
      <div className="inline-flex items-center gap-2 p-1 bg-mute rounded-lg ">
        <Button
          variant="secondary"
          onClick={() => setParams({ view: 'trending' })}
          className={cn(
            'bg-sidebar min-w-0 overflow-hidden relative transition-all duration-300 shadow-xs',
            'hover:bg-linear-to-r hover:from-orange-500/10 hover:via-foreground/10 hover:to-orange-500/10',
            viewType === 'trending' && 'bg-linear-to-r from-orange-500/10 via-foreground/10 to-orange-500/10'
          )}
        >
          <span
            className="absolute  opacity-3  hover:opacity-5 transition-all duration-300  scale-[13] rotate-5 
                -translate-x-3 z-1 
      bg-linear-to-r from-primary via-foreground to-primary text-transparent bg-clip-text "
          >
            {siteName}
          </span>

          <Flame className={cn('h-4 w-4', viewType === 'trending' && 'text-orange-500')} />

          <span className=" font-semibold tracking-tighter">Trending</span>
        </Button>
        <Button
          variant="secondary"
          onClick={() => setParams({ view: 'new' })}
          className={cn(
            'bg-sidebar min-w-0 overflow-hidden relative transition-all duration-300 shadow-xs',
            'hover:bg-linear-to-r hover:from-green-500/10 hover:via-foreground/10 hover:to-green-500/10',
            viewType === 'new' && 'bg-linear-to-r from-green-500/10 via-foreground/10 to-green-500/10'
          )}
        >
          <span
            className="absolute  opacity-3  hover:opacity-5 transition-all duration-300  scale-[13] rotate-5 
                -translate-x-3 z-1 
      bg-linear-to-r from-primary via-foreground to-primary text-transparent bg-clip-text "
          >
            {siteName}
          </span>

          <Sparkles className={cn('h-4 w-4', viewType === 'new' && 'text-green-500')} />

          <span className=" font-semibold tracking-tighter">New</span>
        </Button>
      </div>
    </div>
  );
}
