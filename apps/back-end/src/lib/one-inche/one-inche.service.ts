import { Address, LimitOrder, MakerTraits } from '@1inch/limit-order-sdk';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateLimitOrderDto } from 'src/limit-order/dto/create-limit-order.dto';

export type OrderData = Pick<
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

@Injectable()
export class OneInchService {
  // readonly sdk: Sdk;

  constructor(private readonly configService: ConfigService) {
    // this.sdk = new Sdk({
    //   authKey: this.configService.get('ONE_INCH_AUTH_KEY') as string,
    //   networkId: this.configService.get('CHAIN_ID') as number,
    //   httpConnector: new FetchProviderConnector(),
    // });
  }

  /**
   * Reconstructs a LimitOrder from order data
   */
  reconstructOrder(orderData: OrderData): LimitOrder {
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
        .disablePartialFills()
        .disableMultipleFills()
        .withExpiration(BigInt(orderData.expiration))
        .withNonce(BigInt(orderData.nonce)),
    );
  }

  // async createOrder(orderData: OrderData) {
  //   const order = this.reconstructOrder(orderData);
  //   return this.sdk.createOrder(order);
  // }

  // async submitOrder(
  //   order: LimitOrderWithFee,
  //   signature: string,
  // ): Promise<void> {
  //   return this.sdk.submitOrder(order, signature);
  // }
}
