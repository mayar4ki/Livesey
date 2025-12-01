import { StoreKeys } from '@acme/queue';
import {
    ADMIN_REQUEST_DOMAIN,
    ADMIN_REQUEST_TYPES,
    createAdminRequestMessage,
    getAdminNonceKey,
} from '@acme/shared';
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Address, recoverTypedDataAddress } from 'viem';
import { FactoryAbi } from '../../../../packages/core-contract';
import { Env } from '../config/env-validation.schema';
import { RedisService } from '../lib/redis/redis.service';
import { ViemPublicClientService } from '../lib/viem/viem.service';

/**
 * Guard that verifies admin signature using EIP-712 typed data signing
 *
 * Expected headers:
 * - Authorization: EIP-712 signature (0x...)
 * - X-Signer: Admin wallet address
 * - X-Nonce: Unique nonce (uint256)
 * - X-Timestamp: Request timestamp (uint256, milliseconds)
 *
 * The guard:
 * 1. Verifies nonce hasn't been used (prevents replay attacks)
 * 2. Verifies timestamp is fresh (within 5 minutes)
 * 3. Verifies EIP-712 signature matches the signer
 * 4. Verifies signer is the admin address from the Factory contract
 */
@Injectable()
export class AdminSignatureGuard implements CanActivate {
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
    const nonceKey = getAdminNonceKey(signer, nonceNum.toString());
    const nonceUsed = await this.redis.client.get(nonceKey);

    if (nonceUsed) {
      throw new UnauthorizedException('Nonce has already been used');
    }

    // Get admin address
    const adminAddress = await this.getAdminAddress();

    // Create the message that should have been signed
    const message = createAdminRequestMessage({
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
      adminAddress,
    );

    if (!isValid) {
      throw new UnauthorizedException(
        'Invalid signature or unauthorized signer',
      );
    }

    // Mark nonce as used
    await this.redis.client.setEx(nonceKey, this.NONCE_TTL, '1');

    // Attach admin address to request for use in controllers
    req.adminAddress = signer.toLowerCase();

    return true;
  }

  private async verifyTypedDataSignature(
    signature: string,
    signer: string,
    message: ReturnType<typeof createAdminRequestMessage>,
    expectedAdminAddress: string,
  ): Promise<boolean> {
    try {
      const chainId = this.viemPublicClient.getChainId();

      // Recover the address from the typed data signature
      const recoveredAddress = await recoverTypedDataAddress({
        domain: {
          ...ADMIN_REQUEST_DOMAIN,
          chainId,
        },
        types: ADMIN_REQUEST_TYPES,
        primaryType: 'AdminRequest',
        message,
        signature: signature as `0x${string}`,
      });

      // Verify recovered address matches the signer
      const recoveredLower = recoveredAddress.toLowerCase();
      const signerLower = signer.toLowerCase();

      if (recoveredLower !== signerLower) {
        return false;
      }

      // Verify signer is admin
      const adminLower = expectedAdminAddress.toLowerCase();

      return recoveredLower === adminLower;
    } catch (error) {
      console.error('EIP-712 signature verification error:', error);
      return false;
    }
  }

  private async getAdminAddress(): Promise<string> {
    await this.redis.ensureConnected();

    // Try to get from cache first
    const cachedAdminAddress = await this.redis.client.get(
      StoreKeys.FACTORY_ADMIN_ADDRESS,
    );

    if (cachedAdminAddress) {
      return cachedAdminAddress;
    }

    // If not in cache, fetch from contract
    const adminAddress = await this.viemPublicClient.client.readContract({
      address: this.configService.get('FACTORY_ADDRESS') as Address,
      abi: FactoryAbi,
      functionName: 'admin',
    });

    // Store in Redis with 30 minutes TTL
    await this.redis.client.setEx(
      StoreKeys.FACTORY_ADMIN_ADDRESS,
      1800, // 1800 seconds = 30 minutes
      adminAddress,
    );

    return adminAddress;
  }
}
