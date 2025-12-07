import { Address } from 'viem';
import { z } from 'zod';
import { TokenCreatedEvent } from '../types';

// Ethereum address validation
const ethAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format')
  .refine((addr: string) => addr !== '0x0000000000000000000000000000000000000000', {
    message: 'Address cannot be the zero address',
  }) as z.ZodType<Address>;

// BigInt validation for uint256
const bigIntSchema = z
  .union([z.bigint(), z.string(), z.number()])
  .transform((val) => {
    if (typeof val === 'bigint') return val;
    if (typeof val === 'string') {
      // Handle hex strings (0x...) or decimal strings
      if (val.startsWith('0x')) {
        return BigInt(val);
      }
      return BigInt(val);
    }
    return BigInt(val);
  })
  .refine((val) => val > BigInt(0), {
    message: 'Total supply must be greater than zero',
  });

/**
 * Schema for BeaconProxyCreated event arguments
 * Validates the structure and types of event data at runtime
 */
export const validationSchema = z.object({
  token: ethAddress,
  createdBy: ethAddress,
  name: z.string(),
  symbol: z.string(),
  totalSupply: bigIntSchema,
  assetRefHash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid asset reference hash format') as z.ZodType<Address>,
  operator: ethAddress,
  initialRecipient: ethAddress,
  rewardToken: ethAddress,
});

export type ValidationSchema = z.infer<typeof validationSchema>;

export type ValidatedLog = Omit<TokenCreatedEvent, 'args'> & {
  args: ValidationSchema;
};

/**
 * Validate and filter event logs
 * Returns only logs that pass validation, logs errors for invalid ones
 */
export function validateLog(log: TokenCreatedEvent): ValidatedLog {
  const validatedArgs = validationSchema.parse(log.args);
  return { ...log, args: validatedArgs };
}
