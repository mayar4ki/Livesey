'use client';

import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import type { Address } from 'viem';
import { useChainId } from 'wagmi';
import { useVerifyTokenStatus } from '@/services/token/useVerifyTokenStatus';
import { getContractExplorerUrl } from '@/helpers/getContractExplorerUrl';
import { Separator } from '@/components/ui/separator';

type ContractVerificationCardProps = {
  contractAddress: Address | string;
};

export function ContractVerificationCard({ contractAddress }: ContractVerificationCardProps) {
  const chainId = useChainId();

  // Hook for verification process status src redis queue
  const { data: verificationStatusResponse, isLoading: isCheckingVerificationStatus } = useVerifyTokenStatus({
    contractAddress: contractAddress as `0x${string}`,
    chainId,
  });

  const task = verificationStatusResponse?.data?.task;
  const verificationStatus = task?.status;
  const explorerUrl = getContractExplorerUrl(contractAddress, chainId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.2,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Contract Verification</CardTitle>
          <CardDescription>Verify your smart contract on the block explorer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Section 1: Verification Process */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Verification Process</h3>
              </div>
              {isCheckingVerificationStatus ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Checking verification process...</span>
                </div>
              ) : verificationStatus ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {verificationStatus === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : verificationStatus === 'failed' ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                      <span className="text-xs font-medium">{verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}</span>
                    </div>
                    <Badge variant={verificationStatus === 'completed' ? 'default' : verificationStatus === 'failed' ? 'destructive' : 'secondary'}>
                      {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
                    </Badge>
                  </div>
                  {task?.errorMessage && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{task.errorMessage}</div>}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No verification process found. Start verification to track progress.</div>
              )}
            </div>

            <Separator />

            {/* Contract Address & Explorer Link */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-xs bg-muted px-3 py-2 rounded font-mono break-all flex-1">{contractAddress}</code>
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1 text-xs"
                >
                  View on Explorer
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
