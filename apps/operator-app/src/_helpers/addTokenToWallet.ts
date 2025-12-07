import { toast } from '@acme/ui/sonner';

// Type for ethereum provider
type EthereumProvider = {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>;
};

type AddTokenToWalletParams = {
  address: string;
  symbol: string;
  decimals: number | undefined;
  image?: string;
};

type AddTokenToWalletOptions = {
  onSuccess?: (symbol: string) => void;
  onError?: (error: Error) => void;
};

/**
 * Adds an ERC20 token to the user's wallet using EIP-747 wallet_watchAsset
 * @param params - Token parameters (address, symbol, decimals, optional image)
 * @param options - Callback options for success/error handling
 * @returns Promise that resolves when the token is added or rejects on error
 */
export async function addTokenToWallet(params: AddTokenToWalletParams, options?: AddTokenToWalletOptions): Promise<void> {
  // Validate decimals
  if (params.decimals === undefined || params.decimals === null) {
    const error = new Error('Loading token information...');
    toast.error(error.message);
    options?.onError?.(error);
    throw error;
  }

  if (typeof window === 'undefined') {
    const error = new Error('Window is not available');
    options?.onError?.(error);
    throw error;
  }

  const ethereum = (window as unknown as { ethereum?: EthereumProvider }).ethereum;

  if (!ethereum) {
    const error = new Error('Please install a wallet extension like MetaMask');
    toast.error('Please install a wallet extension like MetaMask');
    options?.onError?.(error);
    throw error;
  }

  try {
    await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: params.address,
          symbol: params.symbol,
          decimals: params.decimals,
          image: params.image || '',
        },
      },
    });
    toast.success(`${params.symbol} added to your wallet successfully!`);
    options?.onSuccess?.(params.symbol);
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Failed to add token to wallet');
    console.error('Error adding token to wallet:', err);

    // Handle different error types with appropriate toast messages
    if (err.message.includes('install')) {
      toast.error('Please install a wallet extension like MetaMask');
    } else if (err.message.includes('Loading')) {
      toast.error(err.message);
    } else {
      toast.error('Failed to add token to wallet. Please try again.');
    }

    options?.onError?.(err);
    throw err;
  }
}
