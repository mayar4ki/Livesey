import { Injectable } from '@nestjs/common';
import { prisma, type PrismaClient } from '@acme/db';

@Injectable()
export class PrismaService {
  // Directly expose the prisma client from @acme/db
  readonly client: PrismaClient = prisma;
}
