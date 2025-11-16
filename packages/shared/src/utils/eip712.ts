import { keccak256, stringToHex } from "viem";

/**
 * Hash the request body deterministically
 */
export function hashRequestBody(body: any): `0x${string}` {
  if (!body || Object.keys(body).length === 0) {
    return keccak256(stringToHex(""));
  }

  // Create deterministic JSON string (sorted keys)
  const jsonString = JSON.stringify(body, Object.keys(body).sort());
  return keccak256(stringToHex(jsonString));
}

/**
 * Create the EIP-712 message for signing an admin request
 */
export function createAdminRequestMessage(params: {
  method: string;
  path: string;
  body: any;
  timestamp: bigint;
  nonce: bigint;
}) {
  const bodyHash = hashRequestBody(params.body);

  return {
    method: params.method,
    path: params.path,
    bodyHash,
    timestamp: params.timestamp,
    nonce: params.nonce,
  };
}
/**
 * Create the EIP-712 message for signing a signature request
 */
export function createSignatureRequestMessage(params: {
  method: string;
  path: string;
  body: any;
  timestamp: bigint;
  nonce: bigint;
}) {
  const bodyHash = hashRequestBody(params.body);

  return {
    method: params.method,
    path: params.path,
    bodyHash,
    timestamp: params.timestamp,
    nonce: params.nonce,
  };
}

/**
 * Generate a nonce for the request
 * You can use this or implement your own nonce generation strategy
 */
export function generateNonce(): bigint {
  // Use timestamp + random component for uniqueness
  return BigInt(Date.now() * 1000 + Math.floor(Math.random() * 1000));
}

/**
 * Generate a Redis key for storing used nonces
 * Used by backend to track nonce usage
 */
export function getAdminNonceKey(address: string, nonce: string): string {
  return `admin:nonce:${address.toLowerCase()}:${nonce}`;
}
/**
 * Generate a Redis key for storing used nonces
 * Used by backend to track nonce usage
 */
export function getSignatureNonceKey(address: string, nonce: string): string {
  return `signature:nonce:${address.toLowerCase()}:${nonce}`;
}
