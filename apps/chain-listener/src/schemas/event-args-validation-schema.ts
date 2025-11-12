import { FactoryAbi } from "@acme/smart-contract";
import { Address, WatchContractEventOnLogsParameter } from "viem";
import { z } from "zod";

// Ethereum address validation
const ethAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
  .refine(
    (addr: string) => addr !== "0x0000000000000000000000000000000000000000",
    {
      message: "Address cannot be the zero address",
    }
  ) as z.ZodType<Address>;

// BigInt validation for uint256
const bigIntSchema = z
  .union([z.bigint(), z.string(), z.number()])
  .transform((val) => {
    if (typeof val === "bigint") return val;
    if (typeof val === "string") {
      // Handle hex strings (0x...) or decimal strings
      if (val.startsWith("0x")) {
        return BigInt(val);
      }
      return BigInt(val);
    }
    return BigInt(val);
  })
  .refine((val) => val > BigInt(0), {
    message: "Total supply must be greater than zero",
  });

/**
 * Schema for BeaconProxyCreated event arguments
 * Validates the structure and types of event data at runtime
 */
export const beaconProxyCreatedEventArgsSchema = z.object({
  createdBeaconProxy: ethAddress,
  deployer: ethAddress,
  name: z.string(),
  symbol: z.string(),
  assetRefHash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid asset reference hash format"),
  totalSupply: bigIntSchema,
});

export type BeaconProxyCreatedEventArgs = z.infer<
  typeof beaconProxyCreatedEventArgsSchema
>;

type BeaconProxyCreatedEventsLog = WatchContractEventOnLogsParameter<
  typeof FactoryAbi,
  "BeaconProxyCreated"
>;

export type ValidatedLog = {
  log: BeaconProxyCreatedEventsLog[number];
  args: BeaconProxyCreatedEventArgs;
};

/**
 * Validate and filter event logs
 * Returns only logs that pass validation, logs errors for invalid ones
 */
export function validateBeaconProxyCreatedEventLogs(
  logs: BeaconProxyCreatedEventsLog
): ValidatedLog[] {
  const validLogs: ValidatedLog[] = [];

  for (const log of logs) {
    try {
      const validatedArgs = beaconProxyCreatedEventArgsSchema.parse(log.args);
      validLogs.push({ log, args: validatedArgs });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        console.error(
          `❌ Event validation failed for transaction ${log.transactionHash}:`,
          errorMessages
        );
      } else {
        console.error(
          `❌ Error validating BeaconProxyCreated event:`,
          error instanceof Error ? error.message : error
        );
      }
    }
  }

  return validLogs;
}
