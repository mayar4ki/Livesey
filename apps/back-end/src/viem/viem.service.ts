import { Injectable, OnModuleInit } from '@nestjs/common';
import { createPublicClient, http, type PublicClient } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

/**
 * Get chain configuration based on chain ID
 */
function getChain(chainId: number) {
  switch (chainId) {
    case sepolia.id:
      return sepolia;
    case mainnet.id:
      return mainnet;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

@Injectable()
export class ViemPublicClientService implements OnModuleInit {
  private _client: PublicClient | null = null;
  private readonly chainId: number;
  private readonly rpcUrl: string;

  constructor() {
    this.chainId = parseInt(process.env.CHAIN_ID || '11155111', 10);
    this.rpcUrl = process.env.CHAIN_RPC_URL || '';

    if (!this.rpcUrl) {
      throw new Error('CHAIN_RPC_URL environment variable is required');
    }
  }

  onModuleInit() {
    this._client = createPublicClient({
      chain: getChain(this.chainId),
      transport: http(this.rpcUrl),
    });
  }

  get client(): PublicClient {
    if (!this._client) {
      throw new Error('ViemPublicClient not initialized');
    }
    return this._client;
  }

  getChainId(): number {
    return this.chainId;
  }
}
