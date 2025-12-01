import { FactoryAbi } from "@acme/smart-contract";
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Address } from "viem";


import { validateLog } from "src/schemas/token-created-validation.js";
import { TokenCreatedEvent } from "src/types/index.js";
import { ViemPublicClientService } from "../../lib/viem/viem.service.js";
import type { Env } from "../../schemas/env-validation-schema.js";
import { QueueVerificationTaskService } from "./queue-verification-task.service.js";
import { StoreDepolyedTokenService } from "./store-deployed-token.service.js";

type Unwatch = () => void;

@Injectable()
export class NewTokenCreatedEventListnerService implements OnModuleInit, OnModuleDestroy {
  private unwatch?: Unwatch;
  private readonly logger = new Logger(NewTokenCreatedEventListnerService.name);

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly viemPublicClient: ViemPublicClientService,

    private readonly queueVerificationTaskService: QueueVerificationTaskService,
    private readonly storeDepolyedTokenService: StoreDepolyedTokenService,
  ) { }

  onModuleInit() {
    this.logger.log("Starting TokenCreated listener");

    const factoryAddress = this.configService.get<string>("FACTORY_ADDRESS", {
      infer: true,
    });

    this.unwatch = this.viemPublicClient.client.watchContractEvent({
      address: factoryAddress as Address,
      abi: FactoryAbi,
      eventName: "TokenCreated",
      onError: (error) => {
        this.logger.error(
          "TokenCreated watcher error",
          error instanceof Error ? error.stack : String(error)
        );
      },
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            await this.handle(log);
          } catch (error) {
            this.logger.error(
              "TokenCreated handler failed",
              error instanceof Error ? error.stack : String(error)
            );
          }
        }
      },
    });

    this.logger.log("TokenCreated listener ready");
  }

  /**
 * Handle TokenCreated events
 * Processes multiple events and stores them in a single database transaction
 */
  private async handle(log: TokenCreatedEvent) {

    console.log(
      `📢 TokenCreated event detected:\n` +
      `  Token: ${log?.args?.token}\n` +
      `  Deployer: ${log?.args?.createdBy}\n` +
      `  Name: ${log?.args?.name}\n` +
      `  Symbol: ${log?.args?.symbol}\n` +
      `  Asset Ref Hash: ${log?.args?.assetRefHash}\n` +
      `  Total Supply: ${log?.args?.totalSupply}\n` +
      `  Transaction: ${log?.transactionHash}\n` +
      `  Block: ${log?.blockNumber}`
    );

    try {
      // Validate log
      const validLog = validateLog(log);

      // 1. Store token in database 
      await this.storeDepolyedTokenService.storeDeployedToken(validLog);

      // 2. Queue verification tasks for token
      await this.queueVerificationTaskService.queueVerificationTask(validLog);
    } catch (error) {
      console.error(
        `❌ Error storing deployed tokens in database:`,
        error instanceof Error ? error.message : error
      );
      // Don't throw - continue listening to other events
    }
  }

  onModuleDestroy() {
    this.unwatch?.();
    this.unwatch = undefined;
  }
}
