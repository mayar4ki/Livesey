import { ethers } from "ethers";
import hre from "hardhat";
import { envValidationSchema } from "./env-validation-schema.js";

export const initializeConnections = async () => {
  console.log(`Initializing Connections... \n`);
  const env = envValidationSchema.parse(process.env);
  const connection = await hre.network.connect();
  const ethersProvider = new ethers.JsonRpcProvider(env.CHAIN_RPC_URL, {
    chainId: connection.id,
    name: connection.networkName,
  });

  return {
    env,
    connection,
    ethersProvider,
  };
};

export type Connections = Awaited<ReturnType<typeof initializeConnections>>;
