import hre from "hardhat";
import { envValidationSchema } from "./env-validation-schema.js";

export const initializeConnections = async () => {
  console.log(`Initializing Connections... \n`);
  const env = envValidationSchema.parse(process.env);
  const connection = await hre.network.connect();

  const [signer] = await connection.ethers.getSigners();
  const deployerAddress = await signer.getAddress();

  return {
    env,
    connection,
    deployerAddress,
  };
};

export type Connections = Awaited<ReturnType<typeof initializeConnections>>;
