'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@acme/ui/alert-dialog';
import { Button } from '@acme/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@acme/ui/form';
import { Input } from '@acme/ui/input';
import { toast } from '@acme/ui/sonner';
import { yupResolver } from '@hookform/resolvers/yup';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Address } from 'viem';
import { useDeleteBeaconProxy } from '~/services/factory/useDeleteBeaconProxy';
import { deleteBeaconProxySchema, type DeleteBeaconProxyFormSchema } from './_libs/validationSchemas';

type DeleteBeaconProxySectionProps = {
  isLoading: boolean;
  isAdmin: boolean;
};

export function DeleteBeaconProxySection({ isLoading, isAdmin }: DeleteBeaconProxySectionProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const { deleteBeaconProxy, isPending: isDeleting, transactionReceipt } = useDeleteBeaconProxy();

  const isPending = isDeleting || transactionReceipt?.isLoading;

  const form = useForm<DeleteBeaconProxyFormSchema>({
    resolver: yupResolver(deleteBeaconProxySchema),
    defaultValues: {
      beaconProxyAddress: '',
    },
  });

  const handleSubmit = (data: DeleteBeaconProxyFormSchema) => {
    setOpenDialog(false);
    deleteBeaconProxy(data.beaconProxyAddress as Address, {
      onSuccess: () => {
        toast.success('Transaction submitted, confirming...', {
          action: {
            label: 'Close',
            onClick: () => {},
          },
        });
        form.reset();
      },
    });
  };

  return (
    <>
      <div className="space-y-2 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">Delete Beacon Proxy</h4>
            <p className="text-sm text-muted-foreground">Remove a beacon proxy from the ledger. This action can only be performed by the admin.</p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setOpenDialog(true)} disabled={!isAdmin || isLoading || isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isDeleting ? 'Approving...' : 'Confirming...'}
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Proxy
              </>
            )}
          </Button>
        </div>
      </div>

      <AlertDialog
        open={openDialog}
        onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) {
            form.reset();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>Delete Beacon Proxy</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4 space-y-3">
              <p className="font-medium text-foreground">Are you sure you want to delete this beacon proxy from the ledger?</p>
              <div className="space-y-2 text-sm">
                <p>Deleting the beacon proxy will:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Remove the beacon proxy from the factory ledger</li>
                  <li>Prevent the proxy from being tracked by the factory</li>
                  <li>Not affect the actual proxy contract or its functionality</li>
                </ul>
                <p className="pt-2 font-medium text-destructive">This action is irreversible and will remove the proxy from the ledger.</p>
              </div>
            </AlertDialogDescription>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="beaconProxyAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Beacon proxy address (0x...)" {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={form.handleSubmit(handleSubmit)} disabled={isPending}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Proxy
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
