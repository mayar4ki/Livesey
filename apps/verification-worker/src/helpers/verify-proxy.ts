import { verifyContractSourcify } from "@acme/core-contract/utils/sourcify-verification";

export async function verifyProxy(beaconProxyAddress: string, chainId: string) {
  console.log(`📝 BeaconProxy address: ${beaconProxyAddress}`);
  console.log(`🌐 Chain ID: ${chainId}`);

  console.log("📋 Found deployment, verifying contracts...\n");

  // Verify BeaconProxy
  console.log("🔍 Verifying BeaconProxy...");
  try {
    await verifyContractSourcify({
      contractAddress: beaconProxyAddress,
      chainId: Number(chainId),
      contractName: "BeaconProxy",
      sourceName: "contracts/BeaconProxy/BeaconProxy.sol",
    });
  } catch (error) {
    console.error(`❌ Failed to verify BeaconProxy: ${error}`);
    throw error;
  }
}
