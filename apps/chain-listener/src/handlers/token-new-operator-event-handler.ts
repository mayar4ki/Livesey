import { prisma } from "@acme/db";
import { WatchContractEventOnLogsParameter } from "viem";
import { FactoryAbi } from "../../../../packages/core-contract";
import { envValidationSchema } from "../schemas/env-validation-schema";

const env = envValidationSchema.parse(process.env);

type EventsLog = WatchContractEventOnLogsParameter<
  typeof FactoryAbi,
  "TokenNewOperatorAddress"
>[number];

/**
 * Handle TokenNewOperatorAddress events
 * Updates the cached operator address in Redis when the operator address changes
 */
export async function handleTokenNewOperatorAddress(log: EventsLog) {
  const newOperatorAddress = log?.args?.operator;
  const tokenAddress = log?.args?.token;

  console.log(
    `📢 TokenNewOperatorAddress event detected:\n` +
      `  New Operator Address: ${newOperatorAddress}\n` +
      `  Token Address: ${tokenAddress}\n` +
      `  Transaction: ${log?.transactionHash}\n` +
      `  Block: ${log?.blockNumber}`
  );

  try {
    await prisma.token.update({
      where: {
        token_chainId: {
          token: tokenAddress as string,
          chainId: env.CHAIN_ID,
        },
      },
      data: {
        operator: newOperatorAddress,
      },
    });

    console.log(`✅ Token operator updated in database: ${tokenAddress}`);
  } catch (error) {
    console.error(`❌ Error updating token operator in database:`, error);
  }
}
