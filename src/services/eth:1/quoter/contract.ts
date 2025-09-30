import {
  QUOTER_ABI,
  QUOTER_CONTRACT_ADDRESS,
} from "@/_config/uniswap-v4-deployments/eth:1";
import { ethers, JsonRpcProvider } from "ethers";

export const contract = new ethers.Contract(
  QUOTER_CONTRACT_ADDRESS,
  QUOTER_ABI, // Import or define the ABI for Quoter contract
  new JsonRpcProvider(process.env.NEXT_PUBLIC_ETH_CHAIN_RPC_URL) // Provide the right RPC address for the chain
);
