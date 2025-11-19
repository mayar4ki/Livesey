import { createVerificationTask } from "@acme/queue";
import { envValidationSchema } from "src/schemas/env-validation-schema";
import { ValidatedLog } from "src/schemas/token-created-validation";

const env = envValidationSchema.parse(process.env);

/**
 * Queue verification tasks for multiple deployed tokens
 * Each task is queued individually - failures don't affect other tasks
 */
export async function queueVerificationTasks(log: ValidatedLog) {
  const token = log.args;

  try {
    await createVerificationTask({
      chainId: env.CHAIN_ID,
      token: {
        token: token.token,
        args: [
          token.name,
          token.symbol,
          token.totalSupply,
          token.assetRefHash,
          token.operator,
          token.initialRecipient,
        ],
      },
    });

    console.log(
      `✅ Task queued: ${token.token} for verification (deployer: ${token.createdBy})`
    );
  } catch (error) {
    console.error(
      `❌ Error queuing verification task for ${token?.token}:`,
      error instanceof Error ? error.message : error
    );
  }
}
