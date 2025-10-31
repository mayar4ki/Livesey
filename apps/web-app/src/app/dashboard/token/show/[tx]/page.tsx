'use client';

import { useParams } from 'next/navigation';
import { TransactionStatusCard } from '../../_components/TransactionStatusCard';
import { ContractVerificationCard } from '../../_components/ContractVerificationCard';
import { useWaitForTransactionReceipt } from 'wagmi';
import { Hash } from 'viem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Page() {
    const params = useParams();
    const tx = params?.tx as string;

    // Validate transaction hash format
    const isValidTxHash = tx && /^0x[a-fA-F0-9]{64}$/.test(tx);
    const txHash = isValidTxHash ? (tx as Hash) : undefined;

    // Get transaction receipt to extract contract address
    const { data: receipt } = useWaitForTransactionReceipt({
        hash: txHash,
        query: {
            enabled: !!txHash,
        },
    });

    const contractAddress = receipt?.contractAddress;

    if (!tx) {
        return (
            <div className="p-4 md:p-6 flex-1 relative">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            Error
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">No transaction hash provided</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isValidTxHash) {
        return (
            <div className="p-4 md:p-6 flex-1 relative">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            Invalid Transaction Hash
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Invalid transaction hash format. Expected format: 0x followed by 64 hexadecimal characters.
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 font-mono break-all">{tx}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 flex-1 relative">
            <div className="space-y-4">
                <TransactionStatusCard txHash={txHash!} />
                {contractAddress && (
                    <ContractVerificationCard contractAddress={contractAddress} />
                )}
            </div>
        </div>
    );
}
