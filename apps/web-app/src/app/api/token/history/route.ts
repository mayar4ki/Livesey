import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@acme/db';
import { z } from 'zod';
import { Address, isAddress } from 'viem';

const historyRequestSchema = z.object({
  walletAddress: z.string().refine(isAddress, {
    message: 'Invalid wallet address format',
  }) as z.ZodType<Address>,
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');

    // Validate searchParams with Zod (throws ZodError if invalid)
    const { walletAddress: validatedWalletAddress } = historyRequestSchema.parse({
      walletAddress,
    });

    // Find the address record and include all verified contracts ordered by verification date
    const address = await prisma.address.findUnique({
      where: { walletAddress: validatedWalletAddress },
      include: {
        verifiedContracts: {
          orderBy: {
            verifiedAt: 'desc',
          },
        },
      },
    });

    // Return empty array if address not found, otherwise return contracts
    return NextResponse.json({
      success: true,
      contracts: address?.verifiedContracts ?? [],
      walletAddress: address?.walletAddress ?? validatedWalletAddress,
    });
  } catch (error) {
    console.error('Error fetching contract history:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch contract history',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
