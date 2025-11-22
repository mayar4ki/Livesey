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
    NEXT_PUBLIC_FACTORY_ADDRESS: ethAddress,
    NEXT_PUBLIC_OUR_ERC20_DECIMALS: z.coerce.number(),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_FACTORY_ADDRESS: process.env.NEXT_PUBLIC_FACTORY_ADDRESS,
    NEXT_PUBLIC_OUR_ERC20_DECIMALS: process.env.NEXT_PUBLIC_OUR_ERC20_DECIMALS,
  },
  skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === 'lint',
});
