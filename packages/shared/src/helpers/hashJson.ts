/**
 * Compute SHA256 hash of a JSON string and return as hex string with 0x prefix
 */
export async function hashJson(jsonString: string): Promise<string> {
  // Normalize JSON by parsing and stringifying to ensure consistent formatting
  const normalizedJson = JSON.stringify(JSON.parse(jsonString));

  // Convert string to Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizedJson);

  // Compute SHA256 hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Return with 0x prefix
  return `0x${hashHex}`;
}
