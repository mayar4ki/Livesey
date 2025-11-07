import { initializeConnections } from "../utils/initialize-connections.js";
import { verifyContractSourcify } from "../utils/sourcify-verification/sourcify-verification.js";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get directory of current file (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const { connection, deployerAddress } = await initializeConnections();
  const chainId = await connection.ethers.provider
    .getNetwork()
    .then((n) => Number(n.chainId));

  console.log(`📝 Deployer address: ${deployerAddress}`);
  console.log(`🌐 Chain ID: ${chainId}\n`);

  // Read deployment addresses from JSON file
  const deploymentPath = join(
    __dirname,
    "..",
    "ignition",
    "deployments",
    `chain-${chainId}`,
    "deployed_addresses.json",
  );

  let deployedAddresses: Record<string, string>;
  try {
    const fileContent = readFileSync(deploymentPath, "utf-8");
    deployedAddresses = JSON.parse(fileContent);
  } catch (error) {
    throw new Error(
      `No deployment found at ${deploymentPath}. Please deploy contracts first using deploy:sepolia`,
    );
  }

  // Extract contract addresses
  const erc20ImplementationAddress =
    deployedAddresses["ERC20FactoryDeployment#ERC20Implementation"];
  const beaconAddress =
    deployedAddresses["ERC20FactoryDeployment#UpgradeableBeacon"];
  const factoryAddress = deployedAddresses["ERC20FactoryDeployment#Factory"];

  if (!erc20ImplementationAddress || !beaconAddress || !factoryAddress) {
    throw new Error("Missing contract addresses in deployment file");
  }

  console.log("📋 Found deployment, verifying contracts...\n");
  console.log(`ERC20Implementation: ${erc20ImplementationAddress}`);
  console.log(`UpgradeableBeacon: ${beaconAddress}`);
  console.log(`Factory: ${factoryAddress}\n`);

  // Verify ERC20Implementation
  console.log("🔍 Verifying ERC20Implementation...");
  try {
    await verifyContractSourcify({
      contractAddress: erc20ImplementationAddress,
      chainId,
      contractName: "ERC20Implementation",
      sourceName: "contracts/ERC20Implementation/ERC20Implementation.sol",
    });
  } catch (error) {
    console.error(`❌ Failed to verify ERC20Implementation: ${error}`);
  }

  // Verify UpgradeableBeacon
  console.log("\n🔍 Verifying UpgradeableBeacon...");
  try {
    await verifyContractSourcify({
      contractAddress: beaconAddress,
      chainId,
      contractName: "UpgradeableBeacon",
      sourceName: "contracts/UpgradeableBeacon/UpgradeableBeacon.sol",
    });
  } catch (error) {
    console.error(`❌ Failed to verify UpgradeableBeacon: ${error}`);
  }

  // Verify Factory
  console.log("\n🔍 Verifying Factory...");
  try {
    await verifyContractSourcify({
      contractAddress: factoryAddress,
      chainId,
      contractName: "Factory",
      sourceName: "contracts/Factory.sol",
    });
  } catch (error) {
    console.error(`❌ Failed to verify Factory: ${error}`);
  }

  console.log("\n✅ Verification process completed!");
}

main().catch(console.error);
