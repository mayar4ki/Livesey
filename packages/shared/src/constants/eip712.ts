/**
 * EIP-712 domain for admin API requests
 */
export const ADMIN_REQUEST_DOMAIN = {
  name: "https://admin.livesey.com",
  version: "1",
} as const;

/**
 * EIP-712 types for admin requests
 */
export const ADMIN_REQUEST_TYPES = {
  AdminRequest: [
    { name: "method", type: "string" },
    { name: "path", type: "string" },
    { name: "bodyHash", type: "bytes32" },
    { name: "timestamp", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
} as const;

/**
 * EIP-712 domain for signature requests
 */
export const SIGNATURE_REQUEST_DOMAIN = {
  name: "https://livesey.com",
  version: "1",
} as const;

/**
 * EIP-712 types for signature requests
 */
export const SIGNATURE_REQUEST_TYPES = {
  SignatureRequest: [
    { name: "method", type: "string" },
    { name: "path", type: "string" },
    { name: "bodyHash", type: "bytes32" },
    { name: "timestamp", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
} as const;
