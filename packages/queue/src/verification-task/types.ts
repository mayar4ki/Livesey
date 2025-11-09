import { Address } from "viem";

export type VerificationTask = {
  contractAddress: Address;
  chainId: number;
  status: "pending" | "processing" | "completed" | "failed";
  args: any[];
};
