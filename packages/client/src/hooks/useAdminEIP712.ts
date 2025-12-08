import {
  ADMIN_REQUEST_DOMAIN,
  ADMIN_REQUEST_TYPES,
  createAdminRequestMessage,
  generateNonce,
} from "@acme/shared";

import { useAccount, useChainId, useSignTypedData } from "wagmi";

export const useAdminEIP712 = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const timestamp = BigInt(Date.now());
  const nonce = generateNonce();

  const { signTypedDataAsync } = useSignTypedData();

  const makeAdminRequest = async (
    method: "POST" | "GET" | "PUT" | "DELETE",
    path: string,
    body: any
  ) => {
    const message = createAdminRequestMessage({
      method,
      path,
      body,
      timestamp,
      nonce,
    });

    const signature = await signTypedDataAsync({
      types: ADMIN_REQUEST_TYPES,
      primaryType: "AdminRequest",
      message,
      domain: {
        ...ADMIN_REQUEST_DOMAIN,
        chainId,
      },
    });

    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: signature,
        "X-Signer": address!,
        "X-Nonce": nonce.toString(),
        "X-Timestamp": timestamp.toString(),
      },
    };
  };

  return { makeAdminRequest };
};
