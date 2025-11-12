import { prisma, type PrismaClient } from '@acme/db';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService {
  // Directly expose the prisma client from @acme/db
  readonly client: PrismaClient = prisma;

  async onModuleDestroy() {
    await prisma.$disconnect();
  }
}
