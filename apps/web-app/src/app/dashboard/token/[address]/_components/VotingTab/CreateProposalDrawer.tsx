import { Button } from '@acme/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@acme/ui/drawer';
import { useIsMobile } from '@acme/ui/hooks/use-mobile';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { CreateProposalForm } from './CreateProposalForm/CreateProposalForm';

export const CreateProposalDrawer = ({ tokenId, onSuccess }: { tokenId: string; onSuccess: () => void }) => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const direction = isMobile ? 'bottom' : 'right';

  return (
    <Drawer open={open} onOpenChange={setOpen} direction={direction}>
      <DrawerTrigger asChild>
        <Button size="default">
          <Plus className="h-4 w-4 mr-2" />
          Create Proposal
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Proposal Creation</DrawerTitle>
        </DrawerHeader>
        <DrawerContent className="p-4 pb-12">
          <CreateProposalForm deployedTokenId={tokenId} onSuccess={onSuccess} />
        </DrawerContent>
      </DrawerContent>
    </Drawer>
  );
};
