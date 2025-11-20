import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

const ethAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format')
  .refine((addr: string) => addr !== '0x0000000000000000000000000000000000000000', {
    message: 'Address cannot be the zero address',
  });

export const env = createEnv({
  extends: [],
  shared: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  },
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {},
  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_ALCHEMY_API_KEY: z.string(),
    NEXT_PUBLIC_BACKEND_URL: z.url(),
    NEXT_PUBLIC_UNISWAP_POOL_MANAGER: ethAddress,
    NEXT_PUBLIC_UNISWAP_UNIVERSAL_ROUTER: ethAddress,
    NEXT_PUBLIC_UNISWAP_POSITION_MANAGER: ethAddress,
    NEXT_PUBLIC_UNISWAP_STATE_VIEW: ethAddress,
    NEXT_PUBLIC_UNISWAP_QUOTER: ethAddress,
    NEXT_PUBLIC_UNISWAP_POOL_SWAP_TEST: ethAddress,
    NEXT_PUBLIC_UNISWAP_POOL_MODIFY_LIQUIDITY_TEST: ethAddress,
    NEXT_PUBLIC_UNISWAP_PERMIT2: ethAddress,
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_UNISWAP_POOL_MANAGER: process.env.NEXT_PUBLIC_UNISWAP_POOL_MANAGER,
    NEXT_PUBLIC_UNISWAP_UNIVERSAL_ROUTER: process.env.NEXT_PUBLIC_UNISWAP_UNIVERSAL_ROUTER,
    NEXT_PUBLIC_UNISWAP_POSITION_MANAGER: process.env.NEXT_PUBLIC_UNISWAP_POSITION_MANAGER,
    NEXT_PUBLIC_UNISWAP_STATE_VIEW: process.env.NEXT_PUBLIC_UNISWAP_STATE_VIEW,
    NEXT_PUBLIC_UNISWAP_QUOTER: process.env.NEXT_PUBLIC_UNISWAP_QUOTER,
    NEXT_PUBLIC_UNISWAP_POOL_SWAP_TEST: process.env.NEXT_PUBLIC_UNISWAP_POOL_SWAP_TEST,
    NEXT_PUBLIC_UNISWAP_POOL_MODIFY_LIQUIDITY_TEST: process.env.NEXT_PUBLIC_UNISWAP_POOL_MODIFY_LIQUIDITY_TEST,
    NEXT_PUBLIC_UNISWAP_PERMIT2: process.env.NEXT_PUBLIC_UNISWAP_PERMIT2,
  },
  skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === 'lint',
});
