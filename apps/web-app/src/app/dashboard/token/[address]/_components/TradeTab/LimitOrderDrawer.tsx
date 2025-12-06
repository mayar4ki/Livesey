import { Button } from '@acme/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@acme/ui/drawer';
import { useIsMobile } from '@acme/ui/hooks/use-mobile';
import { useState } from 'react';
import { Token } from '~/services/token/useToken';
import { LimitOrderForm } from './LimitOrderForm/LimitOrderForm';

export const LimitOrderDrawer = ({ token }: { token: Token }) => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const direction = isMobile ? 'bottom' : 'right';

  return (
    <Drawer open={open} onOpenChange={setOpen} direction={direction}>
      <DrawerTrigger asChild>
        <Button size="default">Create Limit Order</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Limit Order</DrawerTitle>
        </DrawerHeader>
        <DrawerContent className="p-4 pb-12">
          <LimitOrderForm token={token} onClose={() => setOpen(false)} />
        </DrawerContent>
      </DrawerContent>
    </Drawer>
  );
};
