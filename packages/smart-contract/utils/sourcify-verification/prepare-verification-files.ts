import { existsSync, readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Get directory of current file (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get contract metadata from build-info output
 * In Hardhat 3, metadata is stored in the build-info output file
 */
function getContractMetadata(contractName: string, sourceName: string) {
  const contractPackagePath = join(__dirname, "..", "..");
  const buildInfoDir = join(contractPackagePath, "artifacts", "build-info");

  // Find the output file
  const files = readdirSync(buildInfoDir).filter((file) =>
    file.endsWith(".output.json"),
  );

  if (files.length === 0) {
    throw new Error(
      `No build-info output files found in ${buildInfoDir}. Please compile contracts first.`,
    );
  }

  const outputFile = files[0];
  const outputPath = join(buildInfoDir, outputFile);
  const buildOutput = JSON.parse(readFileSync(outputPath, "utf-8"));

  // Find the contract in the output
  // The structure is: output.output.contracts[sourceName][contractName].metadata
  const contracts = buildOutput.output?.contracts;
  if (!contracts) {
    throw new Error("No contracts found in build output");
  }

  // Try different source name formats
  const sourceNameVariants = [
    sourceName, // contracts/Factory.sol
    `project/${sourceName}`, // project/contracts/Factory.sol
    sourceName.replace(/^contracts\//, ""), // Factory.sol
  ];

  for (const variant of sourceNameVariants) {
    if (contracts[variant] && contracts[variant][contractName]) {
      const contractOutput = contracts[variant][contractName];
      if (contractOutput.metadata) {
        return JSON.parse(contractOutput.metadata);
      }
    }
  }

  // If not found, search all keys for the contract name
  for (const [sourcePath, sourceContracts] of Object.entries(contracts)) {
    if (
      typeof sourceContracts === "object" &&
      sourceContracts !== null &&
      contractName in sourceContracts
    ) {
      const contractOutput = (sourceContracts as Record<string, any>)[
        contractName
      ];
      if (contractOutput?.metadata) {
        return JSON.parse(contractOutput.metadata);
      }
    }
  }

  throw new Error(
    `Contract ${contractName} not found in build output for ${sourceName}. Available sources: ${Object.keys(
      contracts,
    )
      .filter((k) => k.includes(contractName) || k.includes(sourceName))
      .slice(0, 5)
      .join(", ")}`,
  );
}

/**
 * Get compilation metadata from build-info
 */
function getCompilationMetadata() {
  const contractPackagePath = join(__dirname, "..", "..");
  const buildInfoDir = join(contractPackagePath, "artifacts", "build-info");

  if (!existsSync(buildInfoDir)) {
    throw new Error(
      `Build info directory not found: ${buildInfoDir}. Please compile contracts first.`,
    );
  }

  const files = readdirSync(buildInfoDir).filter(
    (file) => file.endsWith(".json") && !file.endsWith(".output.json"),
  );

  if (files.length === 0) {
    throw new Error(
      `No build-info files found in ${buildInfoDir}. Please compile contracts first.`,
    );
  }

  const buildInfoFile = files[0];
  const buildInfoPath = join(buildInfoDir, buildInfoFile);
  const buildInfo = JSON.parse(readFileSync(buildInfoPath, "utf-8"));

  return buildInfo;
}

/**
 * Prepare verification files from build info and metadata
 */
export function prepareVerificationFiles(
  contractName: string,
  sourceName: string,
) {
  const buildInfo = getCompilationMetadata();
  const metadata = getContractMetadata(contractName, sourceName);

  const verificationFiles = [
    {
      path: "metadata.json",
      content: JSON.stringify(metadata),
    },
  ];

  // Add all source files from build-info
  for (const [sourcePath, sourceData] of Object.entries(
    buildInfo.input.sources,
  )) {
    if (
      sourceData &&
      typeof sourceData === "object" &&
      "content" in sourceData
    ) {
      // Map source paths - Sourcify expects relative paths
      const relativePath = sourcePath.replace(/^project\//, "");
      verificationFiles.push({
        path: relativePath,
        content: sourceData.content as string,
      });
    }
  }

  return verificationFiles;
}
