import { Address } from "viem";

import { WriteContractParameters } from "viem";
import { ERC20ImplementationAbi } from "../../../core-contract";

export type TokenCreatedArgs = WriteContractParameters<
  typeof ERC20ImplementationAbi,
  "initialize"
>["args"];

export type VerificationTask = {
  token: Address;
  status: "pending" | "processing" | "completed" | "failed";
  args: TokenCreatedArgs;
};
