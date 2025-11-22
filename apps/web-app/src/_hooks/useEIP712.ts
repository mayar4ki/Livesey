import { SIGNATURE_REQUEST_DOMAIN, SIGNATURE_REQUEST_TYPES, createSignatureRequestMessage, generateNonce } from '@acme/shared';

import { useAccount, useChainId, useSignTypedData } from 'wagmi';

export const useEIP712 = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const timestamp = BigInt(Date.now());
  const nonce = generateNonce();

  const { signTypedDataAsync } = useSignTypedData();

  const makeSignatureRequest = async (method: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH', path: string, body: any) => {
    const message = createSignatureRequestMessage({
      method,
      path,
      body,
      timestamp,
      nonce,
    });

    const signature = await signTypedDataAsync({
      types: SIGNATURE_REQUEST_TYPES,
      primaryType: 'SignatureRequest',
      message,
      domain: {
        ...SIGNATURE_REQUEST_DOMAIN,
        chainId,
      },
    });

    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: signature,
        'X-Signer': address!,
        'X-Nonce': nonce.toString(),
        'X-Timestamp': timestamp.toString(),
      },
    };
  };

  return { makeSignatureRequest };
};
