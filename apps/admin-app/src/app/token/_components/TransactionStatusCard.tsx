'use client';

import { getExplorerUrl } from '@acme/shared/utils';
import { Badge } from '@acme/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { CheckCircle2, ExternalLink, Loader2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { Hash } from 'viem';
import { useBlockNumber, useChainId, useWaitForTransactionReceipt } from 'wagmi';

type TransactionStatusCardProps = {
  txHash: Hash;
};

export function TransactionStatusCard({ txHash }: TransactionStatusCardProps) {
  const chainId = useChainId();

  const BLOCK_CONFIRMATIONS = 12; // TODO: Make this configurable

  const [watch, setWatch] = useState(true);
  const { data: currentBlockNumber } = useBlockNumber({ watch });

  const {
    data: receipt,
    isLoading: isWaiting,
    isSuccess,
    isError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: !!txHash,
    },
  });

  const isDeploying = isWaiting;

  const confirmations = useMemo(() => {
    if (!receipt?.blockNumber || !currentBlockNumber) {
      return null;
    }
    return Number(currentBlockNumber - receipt.blockNumber);
  }, [receipt?.blockNumber, currentBlockNumber]);

  useEffect(() => {
    if (confirmations && confirmations >= BLOCK_CONFIRMATIONS) {
      setWatch(false);
    }
  }, [confirmations]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Transaction Status</CardTitle>
          <CardDescription>Your token deployment transaction details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isDeploying && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                {isSuccess && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {isError && <XCircle className="h-5 w-5 text-red-500" />}
                <span className="font-medium">Status</span>
              </div>
              <Badge variant={isDeploying ? 'secondary' : isSuccess ? 'default' : 'destructive'}>
                {isDeploying ? 'Pending' : isSuccess ? 'Confirmed' : 'Failed'}
              </Badge>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground font-medium">Transaction Hash:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-xs bg-muted px-3 py-2 rounded font-mono break-all">{txHash}</code>
                  <a
                    href={getExplorerUrl(txHash, chainId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1 text-xs"
                  >
                    View on Explorer
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {confirmations !== null && (
                <div className="flex flex-col gap-2">
                  <span className="text-muted-foreground font-medium">Block Confirmations:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-3 py-2 rounded font-mono">{confirmations}</code>
                    <span className="text-xs text-muted-foreground">blocks</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
