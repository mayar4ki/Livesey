import * as fs from 'fs';
import { NextRequest } from 'next/server';
import { createPublicClient, createWalletClient, defineChain, http, parseUnits, type Abi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export async function POST(request: NextRequest) {
  const payload = await request.json();





  return [];
}
