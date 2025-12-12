import { createVerificationQueue } from '@acme/queue';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../../schemas/env-validation-schema.js';
import type { ValidatedLog } from '../../schemas/token-created-validation.js';

@Injectable()
export class QueueVerificationTaskService {
  constructor(private readonly configService: ConfigService<Env>) {}

  private readonly verificationQueue = createVerificationQueue();

  /**
   * Queue verification tasks for multiple deployed tokens
   * Each task is queued individually - failures don't affect other tasks
   */
  public async queueVerificationTask(log: ValidatedLog) {
    const token = log.args;
    const chainId = this.configService.get('CHAIN_ID', { infer: true }) ?? 11155111;

    try {
      await this.verificationQueue.add(
        'verification',
        {
          chainId,
          token: {
            token: token.token,
            args: [
              token.name,
              token.symbol,
              token.totalSupply.toString() as unknown as bigint,
              token.assetRefHash,
              token.operator,
              token.initialRecipient,
              token.rewardToken,
            ],
          },
          mode: 'live',
        },
        {
          removeOnFail: false,
        },
      );

      console.log(`✅ Task queued: ${token.token} for verification (deployer: ${token.createdBy})`);
    } catch (error) {
      console.error(
        `❌ Error queuing verification task for ${token?.token}:`,
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }
}
