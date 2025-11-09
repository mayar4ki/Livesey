import { Address } from "viem";
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
  name: z
    .string()
    .min(1, "Token name cannot be empty")
    .max(100, "Token name is too long"),
  symbol: z
    .string()
    .min(1, "Token symbol cannot be empty")
    .max(20, "Token symbol is too long"),
  totalSupply: bigIntSchema,
});

export type BeaconProxyCreatedEventArgs = z.infer<
  typeof beaconProxyCreatedEventArgsSchema
>;
