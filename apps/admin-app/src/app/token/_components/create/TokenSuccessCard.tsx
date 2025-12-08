'use client';

import { getExplorerUrl } from '@acme/client/utils';
import { ERC20ImplementationAbi as ABI } from '@acme/smart-contract';
import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { CheckCircle2, ExternalLink, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Address } from 'viem';
import { useChainId, useReadContract } from 'wagmi';
import { addTokenToWallet } from '~/_helpers/addTokenToWallet';

type TokenSuccessCardProps = {
  tokenAddress: Address;
  tokenName: string;
  tokenSymbol: string;
  onReset: () => void;
};

export function TokenSuccessCard({ tokenAddress, tokenName, tokenSymbol, onReset }: TokenSuccessCardProps) {
  const chainId = useChainId();
  const router = useRouter();
  // Read decimals from the contract
  const { data: decimals, isLoading: isLoadingDecimals } = useReadContract({
    address: tokenAddress,
    abi: ABI,
    functionName: 'decimals',
  });

  const handleAddToWallet = () => {
    addTokenToWallet({
      address: tokenAddress,
      symbol: tokenSymbol,
      decimals: decimals !== undefined ? Number(decimals) : undefined,
    });
  };

  const explorerUrl = getExplorerUrl(tokenAddress as `0x${string}`, chainId);

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
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <div>
              <CardTitle>Token Created Successfully!</CardTitle>
              <CardDescription>Your token has been deployed to the blockchain</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Token Name:</span>
                <span className="text-sm font-semibold">{tokenName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Token Symbol:</span>
                <span className="text-sm font-semibold">{tokenSymbol}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Contract Address:</span>
                <ExplorerLink hash={tokenAddress} chainId={chainId} showFull />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button onClick={handleAddToWallet} variant="default" className="flex-1" disabled={isLoadingDecimals || decimals === undefined}>
                <Plus className="h-4 w-4 mr-2" />
                {isLoadingDecimals ? 'Loading...' : 'Add to Wallet'}
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View on Explorer
                </a>
              </Button>
              <Button variant="outline" className="flex-1" onClick={onReset}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Token
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
