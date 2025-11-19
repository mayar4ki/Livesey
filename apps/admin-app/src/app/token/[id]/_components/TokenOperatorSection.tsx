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
import { CopyButton } from '@acme/ui/bootstrapped/copy-button';
import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@acme/ui/select';
import { toast } from '@acme/ui/sonner';
import { AlertTriangle, Loader2, Settings } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Address } from 'viem';
import { useOperators } from '~/services/factory/useOperators';
import { useSetTokenOperator } from '~/services/factory/useSetTokenOperator';

type TokenOperatorSectionProps = {
  tokenAddress: Address;
  currentOperator: Address;
  chainId: number;
};

export function TokenOperatorSection({ tokenAddress, currentOperator, chainId }: TokenOperatorSectionProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<Address | undefined>(undefined);

  const params = useParams();
  const tokenId = params.id as string;

  const { setTokenOperator, isPending, transactionReceipt } = useSetTokenOperator(tokenId);
  const { operators, isLoading: isLoadingOperators } = useOperators();

  const isPendingTransaction = isPending || transactionReceipt.isLoading;

  // Filter out paused operators and the current operator
  const availableOperators = operators.filter((op) => !op.isPaused && op.operator.toLowerCase() !== currentOperator.toLowerCase());

  const handleOperatorChange = () => {
    if (!selectedOperator) {
      toast.error('Please select an operator');
      return;
    }

    setOpenDialog(false);
    setTokenOperator(tokenAddress, selectedOperator, {
      onSuccess: () => {
        toast.success('Transaction submitted, confirming...', {
          action: {
            label: 'Close',
            onClick: () => {},
          },
        });
        setSelectedOperator(undefined);
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to change operator');
      },
    });
  };

  return (
    <>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Operator Management</CardTitle>
          <CardDescription>Change the operator address for this token. The operator must be active and not paused.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Operator */}
            <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Current Operator</h4>
                <CopyButton
                  textToCopy={currentOperator}
                  successMessage="Operator address copied"
                  errorMessage="Failed to copy"
                  title="Copy address"
                  className="h-7 w-7 p-0"
                />
              </div>
              <div>
                <ExplorerLink hash={currentOperator} chainId={chainId} showFull />
              </div>
            </div>

            {/* Operator Selection */}
            <div className="space-y-2 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">Change Operator</h4>
                  <p className="text-sm text-muted-foreground mb-3">Select a new operator from the list of available active operators.</p>
                </div>
                <Select
                  value={selectedOperator || ''}
                  onValueChange={(value) => setSelectedOperator(value as Address)}
                  disabled={isPendingTransaction || isLoadingOperators || availableOperators.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a new operator" className="font-mono" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingOperators ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading operators...</div>
                    ) : availableOperators.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">No available operators</div>
                    ) : (
                      availableOperators.map((operator) => (
                        <SelectItem key={operator.operator} value={operator.operator}>
                          <div className="flex items-center min-w-0">
                            <span className="font-mono truncate">{operator.operator}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setOpenDialog(true)}
                  disabled={isPendingTransaction || !selectedOperator || availableOperators.length === 0}
                  className="w-full"
                >
                  {isPendingTransaction ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isPending ? 'Approving...' : 'Confirming...'}
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Change Operator
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>Change Token Operator</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4 space-y-3" asChild>
              <div>
                <p className="font-medium text-foreground">Are you sure you want to change the operator for this token?</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium mb-1">Current Operator:</p>
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded block break-all">{currentOperator}</code>
                  </div>
                  <div>
                    <p className="font-medium mb-1">New Operator:</p>
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded block break-all">{selectedOperator || 'Not selected'}</code>
                  </div>
                  <div className="space-y-2 pt-2">
                    <p>Changing the operator will:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Update the operator address in the Factory contract</li>
                      <li>Update the operator in the token contract</li>
                      <li>Emit a TokenNewOperatorAddress event</li>
                    </ul>
                    <p className="pt-2 font-medium text-destructive">This action cannot be undone without another transaction.</p>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedOperator(undefined)}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="default" onClick={handleOperatorChange}>
                <Settings className="h-4 w-4 mr-2" />
                Change Operator
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
