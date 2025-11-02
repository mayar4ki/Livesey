import { Address } from "viem";

export type VerificationTask = {
  contractAddress: Address;
  chainId: number;
  walletAddress: Address;
  status: "pending" | "processing" | "completed" | "failed";
  args: any[];
};
