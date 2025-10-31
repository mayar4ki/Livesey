import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import type { Address } from 'viem';
import { getContractExplorerUrl } from '@/lib/helpers';
import axios from 'axios';

type VerificationStatus = {
    isVerified: boolean;
    verificationUrl?: string;
};

/**
 * Hook to check if a smart contract is verified on Etherscan
 * @param contractAddress - The contract address to check
 * @returns Query result with verification status
 */
export function useContractVerification(contractAddress: Address | string | undefined) {
    const chainId = useChainId();

    return useQuery<VerificationStatus>({
        queryKey: ['contract-verification', contractAddress, chainId],
        queryFn: async () => {
            if (!contractAddress) {
                throw new Error('No contract address provided');
            }

            // Determine the correct Etherscan API endpoint
            const explorerApiUrl =
                chainId === sepolia.id
                    ? 'https://api-sepolia.etherscan.io/api'
                    : 'https://api.etherscan.io/api';

            // Get API key from environment (optional for public endpoints, but recommended)
            const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'YourApiKeyToken';

            try {
                const response = await axios.get(explorerApiUrl, {
                    params: {
                        module: 'contract',
                        action: 'getsourcecode',
                        address: contractAddress,
                        apikey: apiKey,
                    },
                });

                const data = response.data;

                if (data.status !== '1' || !data.result || data.result.length === 0) {
                    return {
                        isVerified: false,
                        verificationUrl: getContractExplorerUrl(contractAddress, chainId),
                    };
                }

                // Contract is verified if SourceCode exists and is not empty
                const sourceCode = data.result[0]?.SourceCode;
                const isVerified = !!sourceCode && sourceCode !== '';

                return {
                    isVerified,
                    verificationUrl: getContractExplorerUrl(contractAddress, chainId),
                };
            } catch (error) {
                console.error('Error checking contract verification:', error);
                // Return unverified on error, but still provide the explorer URL
                return {
                    isVerified: false,
                    verificationUrl: getContractExplorerUrl(contractAddress, chainId),
                };
            }
        },
        enabled: !!contractAddress,
        retry: 2,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
}



