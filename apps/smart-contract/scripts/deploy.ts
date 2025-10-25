import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { verifyContract } from "@nomicfoundation/hardhat-verify/verify";
import hre from "hardhat";
import { initializeConnections } from "../utils/initialize-connections.js";

const deploymentArgs = [
  // _initialSupply
  100,
];

async function main() {
  const { connection } = await initializeConnections();

  console.log(`🚀 Deploying contract...`);

  const { contract } = await connection.ignition.deploy(
    buildModule("Asset", (m) => {
      const contract = m.contract("Asset", deploymentArgs);

      return { contract };
    }),
    {
      deploymentId: hre.globalOptions.network,
      displayUi: true,
    }
  );

  const contractAddress = await contract.getAddress();

  console.log(`✅ Contract deployed address: ${contractAddress} \n`);

  await verifyContract(
    {
      address: contractAddress,
      constructorArgs: deploymentArgs,
      provider:
        connection.networkConfig.chainId === 11155111
          ? "blockscout"
          : "etherscan",
    },
    hre
  );
}

main().catch(console.error);
