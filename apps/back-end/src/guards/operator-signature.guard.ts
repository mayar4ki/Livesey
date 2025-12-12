import { getOperatorStoreKey } from '@acme/cache';
import {
  createOperatorRequestMessage,
  getOperatorNonceKey,
  OPERATOR_REQUEST_DOMAIN,
  OPERATOR_REQUEST_TYPES,
} from '@acme/shared';
import { FactoryAbi } from '@acme/smart-contract';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address, recoverTypedDataAddress, zeroAddress } from 'viem';
import { Env } from '../config/env-validation.schema';
import { RedisService } from '../lib/redis/redis.service';
import { ViemPublicClientService } from '../lib/viem/viem.service';

/**
 * Guard that verifies operator signature using EIP-712 typed data signing
 *
 * Expected headers:
 * - Authorization: EIP-712 signature (0x...)
 * - X-Signer: Operator wallet address
 * - X-Nonce: Unique nonce (uint256)
 * - X-Timestamp: Request timestamp (uint256, milliseconds)
 *
 * The guard:
 * 1. Verifies nonce hasn't been used (prevents replay attacks)
 * 2. Verifies timestamp is fresh (within 5 minutes)
 * 3. Verifies EIP-712 signature matches the signer
 * 4. Verifies signer is the operator address from the Factory contract
 */
@Injectable()
export class OperatorSignatureGuard implements CanActivate {
  private readonly NONCE_TTL = 300; // 5 minutes in seconds
  private readonly MAX_TIMESTAMP_AGE = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(
    private readonly viemPublicClient: ViemPublicClientService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService<Env>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();

    // Extract headers
    const authHeader = req.headers['authorization'];
    const signature = authHeader?.replace(/^Bearer\s+/i, '') || authHeader;
    const signer = req.headers['x-signer'];
    const nonce = req.headers['x-nonce'];
    const timestamp = req.headers['x-timestamp'];

    // Validate required headers
    if (!signature || !signer || !nonce || !timestamp) {
      throw new UnauthorizedException(
        'Missing required headers: Authorization, X-Signer, X-Nonce, X-Timestamp',
      );
    }

    // Validate format
    if (!/^0x[a-fA-F0-9]{130}$/.test(signature)) {
      throw new UnauthorizedException('Invalid signature format');
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(signer)) {
      throw new UnauthorizedException('Invalid signer address format');
    }

    const nonceNum = BigInt(nonce);
    const timestampNum = BigInt(timestamp);

    // Verify timestamp freshness
    const now = BigInt(Date.now());
    const timestampAge = now - timestampNum;

    if (timestampAge > BigInt(this.MAX_TIMESTAMP_AGE)) {
      throw new UnauthorizedException('Request timestamp is too old');
    }

    if (timestampNum > now + BigInt(60000)) {
      // Allow 1 minute clock skew
      throw new UnauthorizedException('Request timestamp is in the future');
    }

    // Verify nonce hasn't been used
    await this.redis.ensureConnected();
    const nonceKey = getOperatorNonceKey(signer, nonceNum.toString());
    const nonceUsed = await this.redis.client.get(nonceKey);

    if (nonceUsed) {
      throw new UnauthorizedException('Nonce has already been used');
    }

    // Create the message that should have been signed
    const message = createOperatorRequestMessage({
      method: req.method,
      path: req.path,
      body: req.body,
      timestamp: timestampNum,
      nonce: nonceNum,
    });

    // Verify EIP-712 signature
    const isValid = await this.verifyTypedDataSignature(
      signature,
      signer,
      message,
    );

    if (!isValid) {
      throw new UnauthorizedException(
        'Invalid signature or unauthorized signer',
      );
    }

    // Mark nonce as used
    await this.redis.client.setEx(nonceKey, this.NONCE_TTL, '1');

    return true;
  }

  private async verifyTypedDataSignature(
    signature: string,
    signer: string,
    message: ReturnType<typeof createOperatorRequestMessage>,
  ): Promise<boolean> {
    try {
      const chainId = this.viemPublicClient.getChainId();

      // Recover the address from the typed data signature
      const recoveredAddress = await recoverTypedDataAddress({
        domain: {
          ...OPERATOR_REQUEST_DOMAIN,
          chainId,
        },
        types: OPERATOR_REQUEST_TYPES,
        primaryType: 'OperatorRequest',
        message,
        signature: signature as `0x${string}`,
      });

      // Verify recovered address matches the signer
      const recoveredLower = recoveredAddress.toLowerCase();
      const signerLower = signer.toLowerCase();

      if (recoveredLower !== signerLower) {
        return false;
      }

      // Get operator address
      const operatorInfo = await this.getOperatorInfo(signer);
      // Verify signer is operator
      const operatorLower = operatorInfo.address.toLowerCase();

      return recoveredLower === operatorLower && !operatorInfo.isPaused;
    } catch (error) {
      console.error('EIP-712 signature verification error:', error);
      return false;
    }
  }

  private async getOperatorInfo(
    address: string,
  ): Promise<{ address: string; isPaused: boolean }> {
    await this.redis.ensureConnected();

    // Try to get from cache first
    const cachedOperatorAddress = await this.redis.client.get(
      getOperatorStoreKey(address),
    );

    if (cachedOperatorAddress) {
      return JSON.parse(cachedOperatorAddress) as {
        address: string;
        isPaused: boolean;
      };
    }

    // If not in cache, fetch from contract
    const operatorInfo = await this.viemPublicClient.client.readContract({
      address: this.configService.get('FACTORY_ADDRESS') as Address,
      abi: FactoryAbi,
      functionName: 'operatorsLedger',
      args: [address as `0x${string}`],
    });

    if (!operatorInfo || operatorInfo[0] === zeroAddress) {
      throw new NotFoundException('Operator not found');
    }

    // Store in Redis with 30 minutes TTL
    await this.redis.client.setEx(
      getOperatorStoreKey(address),
      1800, // 1800 seconds = 30 minutes
      JSON.stringify(operatorInfo),
    );

    return { address: operatorInfo[0], isPaused: operatorInfo[1] };
  }
}
