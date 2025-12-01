declare module '@1inch/solidity-utils/hardhat-setup' {
  import { ChainConfig } from '@nomicfoundation/hardhat-verify/src/types';
  import { Network, NetworksUserConfig } from 'hardhat/types';

  export type Etherscan = {
    apiKey: {
      [key: string]: string;
    };
    customChains: ChainConfig[];
  };

  export function getNetwork(): string;
  export function parseRpcEnv(envRpc: string): {
    url: string;
    authKeyHttpHeader?: string;
  };
  export function resetHardhatNetworkFork(network: Network, networkName: string): Promise<void>;

  export class Networks {
    networks: NetworksUserConfig;
    etherscan: Etherscan;
    constructor(useHardhat?: boolean, forkingNetworkName?: string, saveHardhatDeployments?: boolean);
    register(name: string, chainId: number, rpc?: string, privateKey?: string, etherscanNetworkName?: string, etherscanKey?: string, hardfork?: string): void;
    registerCustom(name: string, chainId: number, url?: string, privateKey?: string, etherscanKey?: string, apiURL?: string, browserURL?: string, hardfork?: string): void;
    registerZksync(name: string, chainId: number, rpc?: string, ethNetwork?: string, privateKey?: string, verifyURL?: string, hardfork?: string): void;
    registerAll(): {
      networks: any ;
      etherscan: Etherscan;
    };
  }
}

