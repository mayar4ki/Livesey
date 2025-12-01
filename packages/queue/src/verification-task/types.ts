import { Address } from "viem";

import { ERC20ImplementationAbi } from "@acme/smart-contract";
import { WriteContractParameters } from "viem";

export type TokenCreatedArgs = WriteContractParameters<
  typeof ERC20ImplementationAbi,
  "initialize"
>["args"];

export type VerificationTask = {
  token: Address;
  status: "pending" | "processing" | "completed" | "failed";
  args: TokenCreatedArgs;
};
