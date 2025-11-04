import { getNetworkName } from "@acme/helpers";
import { Address } from "viem";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);

// Get directory of current file (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type VerifyContractProps = {
  contractAddress: Address;
  chainId: number;
  args: any[];
};

/**
 * Verify contract using Hardhat
 */
export async function verifyContract({
  contractAddress,
  chainId,
  args,
}: VerifyContractProps): Promise<boolean> {
  // Get network name
  const networkName = getNetworkName(chainId);

  // Path to smart-contract package (where package.json and hardhat.config.ts are located)
  // Resolve from the script file location: scripts/verifyContract.ts -> packages/smart-contract/
  const contractPackagePath = path.resolve(__dirname, "..");

  // Build Hardhat verify command with constructor args
  // Format: hardhat verify --network <network> <contractAddress> <arg1> <arg2> ...
  const argsString =
    args.length > 0
      ? args
          .map((arg) => {
            // Handle different argument types
            if (typeof arg === "string") {
              // Quote strings with spaces
              return arg.includes(" ") ? `"${arg}"` : arg;
            }
            if (typeof arg === "bigint") {
              return arg.toString();
            }
            return String(arg);
          })
          .join(" ")
      : "";

  const verifyCommand = `CHAIN_RPC_URL='${process.env.CHAIN_RPC_URL}' ETHERSCAN_API_KEY='${process.env.ETHERSCAN_API_KEY}' ACCOUNT_PRIVATE_KEY='xxxxxxxxxx' pnpm run hardhat verify --force --network ${networkName} ${contractAddress} ${argsString ? `${argsString}` : ""}`;

  console.log(`🚀Executing Hardhat verify command22: ${verifyCommand}`);

  try {
    const { stdout, stderr } = await execAsync(verifyCommand, {
      cwd: contractPackagePath,
    });

    console.log("Verification output:", stdout);
    if (stderr) {
      console.warn("Verification warnings:", stderr);
    }

    // Check if verification was successful
    const isVerified =
      stdout.includes("Successfully verified") ||
      stdout.includes("already verified");

    if (isVerified) {
      console.log(`✅ Contract verified successfully: ${contractAddress}`);
    } else {
      throw new Error(`❌ Verification may have failed. Output: ${stdout}`);
    }

    return isVerified;
  } catch (error: any) {
    // Check if it's already verified (non-fatal)
    if (
      error.stdout?.includes("already verified") ||
      error.stderr?.includes("already verified")
    ) {
      console.log(`✓ Contract already verified: ${contractAddress}`);
      return true; // Return true since it's already verified
    }

    throw new Error(
      `Hardhat verify failed: ${error.message}\nStdout: ${error.stdout}\nStderr: ${error.stderr}`,
    );
  }
}
