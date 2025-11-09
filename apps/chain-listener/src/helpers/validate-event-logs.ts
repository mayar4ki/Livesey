import { FactoryAbi } from "@acme/smart-contract";
import { WatchContractEventOnLogsParameter } from "viem";
import { z } from "zod";

import {
  BeaconProxyCreatedEventArgs,
  beaconProxyCreatedEventArgsSchema,
} from "../schemas/event-args-validation-schema.js";

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
export function validateEventLogs(
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
