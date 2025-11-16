import { hashJson } from "./hashJson";

const DEFAULT_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export type KeyValuePair = {
  key: string;
  value: string;
};

/**
 * Compute SHA256 hash from an array of key-value pairs
 * @param pairs Array of key-value pairs
 * @returns Promise resolving to the hash string (0x + 64 hex chars) or default hash if no valid pairs
 */
export async function computeHashFromPairs(
  pairs: KeyValuePair[]
): Promise<string> {
  if (pairs.length === 0) {
    return DEFAULT_HASH;
  }

  try {
    // Convert pairs to JSON object
    const jsonObject: Record<string, string> = {};
    pairs.forEach((pair) => {
      if (pair.key && pair.value) {
        jsonObject[pair.key] = pair.value;
      }
    });

    // Only compute hash if there's at least one valid pair
    if (Object.keys(jsonObject).length > 0) {
      const jsonString = JSON.stringify(jsonObject);
      return await hashJson(jsonString);
    }

    // Return default hash if no valid pairs
    return DEFAULT_HASH;
  } catch (error) {
    // Error converting to JSON - return default hash
    console.error("Error computing hash from pairs:", error);
    return DEFAULT_HASH;
  }
}
