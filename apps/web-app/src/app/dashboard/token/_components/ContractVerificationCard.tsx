'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, ExternalLink, Loader2 } from 'lucide-react';
import { useContractVerification } from '@/hooks/useContractVerification';
import type { Address } from 'viem';

type ContractVerificationCardProps = {
    contractAddress: Address | string;
};

export function ContractVerificationCard({ contractAddress }: ContractVerificationCardProps) {

    const { data: verification, isLoading: isCheckingVerification } = useContractVerification(contractAddress);

    const handleVerify = () => {
        // TODO: Implement verification logic
        console.log('Verify button clicked for:', contractAddress);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Contract Verification</CardTitle>
                <CardDescription>Verify your smart contract on the block explorer</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isCheckingVerification ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                    <span className="font-medium">Checking Status...</span>
                                </>
                            ) : verification?.isVerified ? (
                                <>
                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                    <span className="font-medium">Verification Status</span>
                                </>
                            ) : (
                                <>
                                    <ShieldAlert className="h-5 w-5 text-yellow-500" />
                                    <span className="font-medium">Verification Status</span>
                                </>
                            )}
                        </div>
                        {!isCheckingVerification && verification && (
                            <Badge variant={verification.isVerified ? 'default' : 'secondary'}>
                                {verification.isVerified ? 'Verified' : 'Not Verified'}
                            </Badge>
                        )}
                    </div>

                    {verification && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <code className="text-xs bg-muted px-3 py-2 rounded font-mono break-all flex-1">
                                    {contractAddress}
                                </code>
                                {verification.verificationUrl && (
                                    <a
                                        href={verification.verificationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline inline-flex items-center gap-1 text-xs"
                                    >
                                        View on Explorer
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <Button
                            onClick={handleVerify}
                            variant={verification?.isVerified ? 'outline' : 'default'}
                            className="w-full"
                            disabled={isCheckingVerification}
                        >
                            {verification?.isVerified ? 'Re-verify Contract' : 'Verify Contract'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

