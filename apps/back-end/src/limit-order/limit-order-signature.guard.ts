import { Address, LimitOrder, MakerTraits } from '@1inch/limit-order-sdk';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { recoverTypedDataAddress } from 'viem';
import { CreateLimitOrderDto } from './dto/create-limit-order.dto';

type OrderData = Pick<
  CreateLimitOrderDto,
  | 'makeToken'
  | 'takeToken'
  | 'makeAmount'
  | 'takeAmount'
  | 'nonce'
  | 'expiration'
  | 'salt'
> & {
  maker: string;
};

/**
 * Guard that verifies 1inch limit order signature and order hash
 *
 * This guard ensures that:
 * 1. The order hash matches the order data
 * 2. The order signature is valid and matches the maker address
 *
 * Must be used after SignatureGuard to ensure x-signer header is available
 */
@Injectable()
export class LimitOrderSignatureGuard implements CanActivate {
  constructor() {}

  /**
   * Reconstructs a LimitOrder from order data
   */
  private reconstructOrder(orderData: OrderData): LimitOrder {
    return new LimitOrder(
      {
        makerAsset: new Address(orderData.makeToken),
        takerAsset: new Address(orderData.takeToken),
        makingAmount: BigInt(orderData.makeAmount),
        takingAmount: BigInt(orderData.takeAmount),
        maker: new Address(orderData.maker),
        receiver: new Address(orderData.maker),
        salt: BigInt(orderData.salt),
      },
      MakerTraits.default()
        .withExpiration(BigInt(orderData.expiration))
        .withNonce(BigInt(orderData.nonce)),
    );
  }

  /**
   * Verifies that the order hash matches the order data
   */
  verifyOrderHash(
    orderData: OrderData,
    providedOrderHash: string,
    chainId: number,
  ): boolean {
    try {
      const order = this.reconstructOrder(orderData);
      const calculatedOrderHash = order.getOrderHash(chainId);

      return (
        calculatedOrderHash.toLowerCase() === providedOrderHash.toLowerCase()
      );
    } catch (error) {
      console.error('Error verifying order hash:', error);
      return false;
    }
  }

  /**
   * Verifies that the order signature is valid and matches the maker address
   */
  async verifyOrderSignature(
    orderData: OrderData,
    signature: string,
    expectedMaker: string,
    chainId: number,
  ): Promise<boolean> {
    try {
      const order = this.reconstructOrder(orderData);
      const typedData = order.getTypedData(chainId);

      const recoveredAddress = await recoverTypedDataAddress({
        domain: typedData.domain,
        types: typedData.types,
        primaryType: 'Order',
        message: typedData.message,
        signature: signature as `0x${string}`,
      });

      return (
        recoveredAddress.toLowerCase() === expectedMaker.toLowerCase() &&
        recoveredAddress.toLowerCase() === orderData.maker.toLowerCase()
      );
    } catch (error) {
      console.error('Error verifying order signature:', error);
      return false;
    }
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const dto: CreateLimitOrderDto = req.body;
    const signer = req.headers['x-signer']; // From SignatureGuard

    if (!signer) {
      throw new BadRequestException(
        'Missing x-signer header. SignatureGuard must be applied before LimitOrderSignatureGuard',
      );
    }

    // Prepare order data once
    const orderData: OrderData = {
      makeToken: dto.makeToken,
      takeToken: dto.takeToken,
      makeAmount: dto.makeAmount,
      takeAmount: dto.takeAmount,
      maker: signer,
      nonce: dto.nonce,
      salt: dto.salt,
      expiration: dto.expiration,
    };

    // Verify the order hash matches the order data
    const orderHashValid = this.verifyOrderHash(
      orderData,
      dto.orderHash,
      dto.chainId,
    );

    if (!orderHashValid) {
      throw new BadRequestException('Order hash does not match the order data');
    }

    // Verify the order signature matches the order payload and maker
    const signatureValid = await this.verifyOrderSignature(
      orderData,
      dto.signature,
      signer,
      dto.chainId,
    );

    if (!signatureValid) {
      throw new BadRequestException(
        'Order signature is invalid or does not match the order data',
      );
    }

    return true;
  }
}
