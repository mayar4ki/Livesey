const SOURCIFY_API_URL = "https://sourcify.dev/server";

type SourcifyVerificationResult = {
  address?: string;
  chainId?: string;
  status?: string;
  message?: string;
  [key: string]: unknown;
};

export type SourcifyApiResponse = {
  result?: SourcifyVerificationResult[];
  status?: string;
  message?: string;
  [key: string]: unknown;
};

/**
 * Submit verification request to Sourcify API
 */
export async function submitVerificationRequest(
  formData: FormData,
): Promise<void> {
  const _res = await fetch(`${SOURCIFY_API_URL}/verify`, {
    method: "POST",
    body: formData,
  });

  if (!_res.ok) {
    const errorText = await _res.text();
    throw new Error(`HTTP error! status: ${_res.status}, body: ${errorText}`);
  }
  const res = (await _res.json()) as SourcifyApiResponse;

  const result = res?.result?.[0] ?? res;

  if (result.status === "perfect" || result.status === "partial") {
    console.log(`   Status: ${result.status}`);
    console.log(`   Message: ${result.message ?? "__"}`);
    return;
  }

  throw new Error(
    `Verification failed: ${result.status || JSON.stringify(result)}`,
  );
}
