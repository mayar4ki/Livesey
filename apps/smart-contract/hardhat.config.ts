import type { HardhatUserConfig } from "hardhat/config";

import HardhatIgnitionEthersPlugin from "@nomicfoundation/hardhat-ignition-ethers";
import hardhatVerify from "@nomicfoundation/hardhat-verify";

import { configVariable } from "hardhat/config";

const config: HardhatUserConfig = {
  plugins: [HardhatIgnitionEthersPlugin, hardhatVerify],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    sepolia: {
      type: "http",
      chainType: "l1",
      chainId: 11155111,
      url: configVariable("CHAIN_RPC_URL"),
      accounts: [configVariable("ACCOUNT_PRIVATE_KEY")],
    },
    avalancheFujiTestnet: {
      type: "http",
      url: configVariable("CHAIN_RPC_URL"),
      chainId: 43113,
      accounts: [configVariable("ACCOUNT_PRIVATE_KEY")],
    },
  },
  verify: {
    etherscan: {
      apiKey: configVariable("ETHERSCAN_API_KEY"),
    },
    blockscout: {},
  },
  chainDescriptors: {
    43113: {
      name: "avalancheFujiTestnet",
      blockExplorers: {
        etherscan: {
          apiUrl:
            "https://api.routescan.io/v2/network/testnet/evm/43113/etherscan",
          url: "https://testnet.snowtrace.io",
        },
      },
    },
  },
};

export default config;
