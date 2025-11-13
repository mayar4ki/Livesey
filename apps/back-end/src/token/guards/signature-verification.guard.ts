import { StoreKeys } from '@acme/queue';
import { FactoryAbi } from '@acme/smart-contract';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { recoverMessageAddress } from 'viem';
import { RedisService } from '../../redis/redis.service';
import { ViemPublicClientService } from '../../viem/viem.service';

@Injectable()
export class SignatureVerificationGuard implements CanActivate {
  constructor(
    private readonly viemPublicClient: ViemPublicClientService,
    private readonly redis: RedisService,
  ) {}

  private async verifySignature(
    payload: any,
    signature: string,
    signer: string,
    expectedAdminAddress: string,
  ): Promise<boolean> {
    try {
      // Create the message to verify
      // You should use the same message format that the client uses to sign
      const message = this.createMessage(payload);

      // Recover the address from the signature
      const recoveredAddress = await recoverMessageAddress({
        message,
        signature: signature as `0x${string}`,
      });

      // Check if recovered address matches the signer and is the admin
      const recoveredLower = recoveredAddress.toLowerCase();
      const signerLower = signer.toLowerCase();

      return (
        recoveredLower === signerLower &&
        recoveredLower === expectedAdminAddress
      );
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  private createMessage(payload: any): string {
    // Create a deterministic message from the payload
    // This should match exactly what the client signs
    // Example: JSON.stringify with sorted keys, or a specific format
    const messagePayload = {
      assetRefHash: payload.assetRefHash,
      seedData: payload.seedData,
    };

    return JSON.stringify(messagePayload, Object.keys(messagePayload).sort());
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
      address: process.env.FACTORY_ADDRESS as `0x${string}`,
      abi: FactoryAbi,
      functionName: 'admin',
      args: [],
    });

    // Store in Redis with 30 minutes TTL
    await this.redis.client.setEx(
      StoreKeys.FACTORY_ADMIN_ADDRESS,
      1800,
      adminAddress,
    );

    return adminAddress;
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();

    // Get admin address from cache or contract
    const adminAddress = await this.getAdminAddress();

    // Verify signature
    const isValid = await this.verifySignature(
      req.body,
      req.body.signature,
      req.body.signer,
      adminAddress,
    );

    return isValid;
  }
}
