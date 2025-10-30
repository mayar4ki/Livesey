import { ZeroAddress } from "ethers";
import { z } from "zod";

const ethAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address")
  .refine((addr) => addr !== ZeroAddress, {
    message: "Address cannot be the zero address",
  });

const donID = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid don address")
  .refine((addr) => addr !== ZeroAddress, {
    message: "Address cannot be the zero address",
  });

const endpoints = z.string().refine(
  (val) => {
    return val.split(",").every((url) => /^https:\/\/.+/.test(url));
  },
  { message: "Invalid endpoint list" }
);

const functionDonId = z.string().min(1);
const url = z.url();
const privateKey = z
  .string()
  .regex(/^([a-fA-F0-9]{64})$/, "Invalid private key");
const apiKey = z.string().min(16, "API key too short");

export const envValidationSchema = z.object({
  // Hardhat Configuration
  CHAIN_RPC_URL: url,
  ACCOUNT_PRIVATE_KEY: privateKey,
  ETHERSCAN_API_KEY: apiKey,
});
