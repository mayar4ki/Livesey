import { ArrowUpRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { badge, buttons, description, heading } from '@/white-label/home';
import { HeroCard } from './HeroCard';

export const HeroSection = () => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {badge && (
              <Badge variant="outline">
                {badge}
                <ArrowUpRight className="ml-2 size-4" />
              </Badge>
            )}
            <h1 className="my-6 text-pretty text-4xl font-bold lg:text-6xl">{heading}</h1>
            <p className="text-muted-foreground mb-8 max-w-xl lg:text-xl">{description}</p>
            <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
              {buttons.primary && <Button className="w-full sm:w-auto">{buttons.primary.text}</Button>}
            </div>
          </div>
          <HeroCard />
        </div>
      </div>
    </section>
  );
};
