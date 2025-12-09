import {
  OPERATOR_REQUEST_DOMAIN,
  OPERATOR_REQUEST_TYPES,
  createOperatorRequestMessage,
  generateNonce,
} from "@acme/shared";

import { useAccount, useChainId, useSignTypedData } from "wagmi";

export const useOperatorEIP712 = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const timestamp = BigInt(Date.now());
  const nonce = generateNonce();

  const { signTypedDataAsync } = useSignTypedData();

  const makeOperatorRequest = async (
    method: "POST" | "GET" | "PUT" | "DELETE",
    path: string,
    body: any
  ) => {
    const message = createOperatorRequestMessage({
      method,
      path,
      body,
      timestamp,
      nonce,
    });

    const signature = await signTypedDataAsync({
      types: OPERATOR_REQUEST_TYPES,
      primaryType: "OperatorRequest",
      message,
      domain: {
        ...OPERATOR_REQUEST_DOMAIN,
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

  return { makeOperatorRequest };
};
