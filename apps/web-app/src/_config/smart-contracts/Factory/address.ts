import { Address } from 'viem';
import { env } from '~/env';

export const ADDRESS = env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;
