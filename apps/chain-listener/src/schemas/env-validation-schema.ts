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
  );

// Chain ID validation (must be a positive integer)
// Defaults to Sepolia (11155111) if not provided
const chainId = z
  .string()
  .transform((val: string | undefined) => {
    return val ? parseInt(val, 10) : 11155111; // Default to Sepolia
  })
  .pipe(z.number().int().positive());

// Redis URL validation (optional, has default in queue package)
const redisUrl = z.url().optional();

export const envValidationSchema = z.object({
  // Blockchain Configuration
  CHAIN_RPC_URL: z.url("Invalid RPC URL format"),
  FACTORY_ADDRESS: ethAddress,
  CHAIN_ID: chainId,

  // Redis Configuration (optional)
  REDIS_URL: redisUrl,

  // Backend API URL (required for Snapshot space creation)
  BACKEND_URL: z.url("Invalid backend URL format"),
});

export type Env = z.infer<typeof envValidationSchema>;

/**
 * Validate and parse environment variables
 * Throws an error with detailed messages if validation fails
 */
export function validateEnv(env: any): Env {
  const result = envValidationSchema.safeParse(env);

  if (result.success) {
    return result.data;
  }

  const details =
    result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n") || "Unknown validation error";

  throw new Error(`Environment validation failed:\n${details}`);
}
