import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { initializeConnections } from "../utils/initialize-connections.js";

async function main() {
  const { connection, deployerAddress, env } = await initializeConnections();

  console.log(`📝 Deployer address: ${deployerAddress} \n`);

  const { beacon, factory } = await connection.ignition.deploy(
    buildModule("ERC20FactoryDeployment", (m) => {
      // Deploy ERC20Implementation
      const erc20Implementation = m.contract("ERC20Implementation");

      // Deploy Beacon (depends on ERC20Implementation)
      const beacon = m.contract("UpgradeableBeacon", [
        erc20Implementation,
        m.getParameter("_initialOwner", deployerAddress),
      ]);

      // Deploy Factory (depends on Beacon)
      const factory = m.contract("Factory", [
        m.getParameter("_ownerAddress", env.OWNER_ADDRESS),
        m.getParameter("_adminAddress", env.ADMIN_ADDRESS),
        beacon,
      ]);

      return {
        erc20Implementation,
        beacon,
        factory,
      };
    }),
    { displayUi: true },
  );

  console.log(`\n 🚀 Transferring beacon ownership to factory contract... \n`);
  // Transfer beacon ownership
  const factoryAddress = await factory.getAddress();
  await beacon.transferOwnership(factoryAddress);
  console.log(`✅ Beacon ownership transferred \n`);
}

main().catch(console.error);
