import { Injectable, Logger } from '@nestjs/common';

import { RedisService } from '../redis/redis.service.js';
import {
  deserializeWatermark,
  isNewerWatermark,
  makeWatermarkKey,
  serializeWatermark,
  type Watermark,
  type WatermarkKeyParams,
} from '@acme/shared';

@Injectable()
export class WatermarkService {
  private readonly logger = new Logger(WatermarkService.name);

  constructor(private readonly redisService: RedisService) {}

  async getWatermark(params: WatermarkKeyParams): Promise<Watermark | null> {
    await this.redisService.ensureConnected();

    const key = makeWatermarkKey(params);
    const raw = await this.redisService.client.get(key);

    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw);
      return deserializeWatermark(parsed);
    } catch (error) {
      this.logger.error(`Failed to parse watermark for key ${key}`, error instanceof Error ? error.stack : String(error));
      return null;
    }
  }

  async setIfNewer(params: WatermarkKeyParams, watermark: Watermark): Promise<Watermark | null> {
    const current = await this.getWatermark(params);

    if (!isNewerWatermark(current, watermark)) {
      return current;
    }

    const key = makeWatermarkKey(params);
    await this.redisService.client.set(key, JSON.stringify(serializeWatermark(watermark)));

    return watermark;
  }
}
