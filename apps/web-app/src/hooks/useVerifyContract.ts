import { useMutation } from '@tanstack/react-query';
import { useChainId } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import type { Address } from 'viem';
import axios from 'axios';

type VerifyContractRequest = {
    contractAddress: Address | string;
    sourceCode: string;
    compilerVersion: string;
    optimization?: boolean;
    runs?: number;
    codeformat?: 'solidity-single-file' | 'solidity-standard-json-input';
    chainId?: number;
};

type VerifyContractResponse = {
    status: string;
    message: string;
    result?: string;
};

/**
 * Hook to verify a smart contract on Etherscan
 * @returns Mutation hook for contract verification
 */
export function useVerifyContract() {
    const chainId = useChainId();

    return useMutation({
        mutationFn: async (params: VerifyContractRequest) => {
            const {
                contractAddress,
                sourceCode,
                compilerVersion,
                optimization = false,
                runs = 200,
                codeformat = 'solidity-single-file',
                chainId: paramChainId,
            } = params;

            // Use provided chainId or fallback to current chainId
            const targetChainId = paramChainId || chainId;

            // Use Etherscan API v2 unified endpoint
            const explorerApiUrl = 'https://api.etherscan.io/v2/api';

            // Get API key from environment
            const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'YourApiKeyToken';

            // Prepare verification request parameters
            // V2 API requires chainid parameter
            const verificationParams = new URLSearchParams({
                chainid: targetChainId.toString(),
                module: 'contract',
                action: 'verifysourcecode',
                apikey: apiKey,
                contractaddress: contractAddress,
                sourceCode: sourceCode,
                codeformat: codeformat,
                compilerversion: compilerVersion,
                optimizationUsed: optimization ? '1' : '0',
                runs: runs.toString(),
            });

            // Make POST request to Etherscan API
            const response = await axios.post<VerifyContractResponse>(
                explorerApiUrl,
                verificationParams.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            const data = response.data;

            // Check if verification was successful
            if (data.status === '1' || data.status === '0') {
                return {
                    success: data.status === '1',
                    message: data.message,
                    guid: data.result, // Etherscan returns a GUID for verification status checking
                };
            }

            throw new Error(data.message || 'Verification request failed');
        },
    });
}

