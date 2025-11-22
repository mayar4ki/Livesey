import { env } from '~/env';

/**
 * Get the decimals for our ERC20 token from environment variable
 * @returns The number of decimals for our token (defaults to 6)
 */
export function getOurTokenDecimals(): number {
  return env.NEXT_PUBLIC_OUR_ERC20_DECIMALS;
}
