import { z } from "zod";

// Redis URL validation (optional, has default in queue package)
const redisUrl = z.string().url().optional();

export const envValidationSchema = z.object({
  // Database Configuration (required)
  DATABASE_URL: z.url("Invalid DATABASE_URL format"),

  // Redis Configuration (optional, has default in queue package)
  REDIS_URL: redisUrl,
});

export type Env = z.infer<typeof envValidationSchema>;

/**
 * Validate and parse environment variables
 * Throws an error with detailed messages if validation fails
 */
export function validateEnv(env: any): Env {
  try {
    return envValidationSchema.parse(env);
  } catch (error) {
    console.error("❌ Environment validation failed:");
    if (error instanceof z.ZodError) {
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      });
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}
