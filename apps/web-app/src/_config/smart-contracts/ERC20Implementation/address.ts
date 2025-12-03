import { Address } from 'viem';
import { env } from '~/env';

export const ADDRESS = env.NEXT_PUBLIC_ERC20_IMPLEMENTATION_ADDRESS as Address;
