import { WatchContractEventOnLogsParameter } from "viem";
import { FactoryAbi } from "../../../../packages/core-contract";

import { StoreKeys } from "@acme/queue";
import { redis } from "@acme/queue/client";

type NewAdminAddressEventsLog = WatchContractEventOnLogsParameter<
  typeof FactoryAbi,
  "NewAdminAddress"
>[number];

/**
 * Handle NewAdminAddress events
 * Updates the cached admin address in Redis when the admin address changes
 */
export async function handleNewAdminAddressEvent(
  log: NewAdminAddressEventsLog
) {
  const newAdminAddress = log?.args?.admin;

  console.log(
    `📢 NewAdminAddress event detected:\n` +
      `  New Admin Address: ${newAdminAddress}\n` +
      `  Transaction: ${log?.transactionHash}\n` +
      `  Block: ${log?.blockNumber}`
  );

  try {
    // Update the cached admin address in Redis with 30 minutes TTL
    if (newAdminAddress) {
      await redis.setEx(StoreKeys.FACTORY_ADMIN_ADDRESS, 1800, newAdminAddress);
    } else {
      throw Error("admin address not found");
    }
  } catch (error) {
    console.error(
      `❌ Error updating admin address cache in Redis:`,
      error instanceof Error ? error.message : error
    );
    // Don't throw - continue listening to other events
  }
}
