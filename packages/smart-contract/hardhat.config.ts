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
      accounts: process.env.ACCOUNT_PRIVATE_KEY
        ? [configVariable("ACCOUNT_PRIVATE_KEY")]
        : [],
    },
  },
  verify: {
    etherscan: {
      apiKey: configVariable("ETHERSCAN_API_KEY"),
      enabled: false,
    },
    blockscout: {
      enabled: true,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
