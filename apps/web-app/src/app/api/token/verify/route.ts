import { NextRequest, NextResponse } from 'next/server';
import { createVerificationTask } from '@/lib/redis';
import { z } from 'zod';
import { Address, isAddress } from 'viem';

const verificationRequestSchema = z.object({
  contractAddress: z.string().refine(isAddress, {
    message: 'Invalid contract address',
  }) as z.ZodType<Address>,
  chainId: z.number().int().positive(),
  walletAddress: z.string().refine(isAddress, {
    message: 'Invalid wallet address',
  }) as z.ZodType<Address>,
  args: z.array(z.string().regex(/^[a-zA-Z0-9]+$/, 'Only alphanumeric characters are allowed')),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = verificationRequestSchema.parse(body);

    // Create task in Redis and add to queue
    const task = await createVerificationTask({
      walletAddress: validatedData.walletAddress,
      contractAddress: validatedData.contractAddress,
      chainId: validatedData.chainId,
      args: validatedData.args,
    });

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contract already verified',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Verification task queued successfully',
        contractAddress: task.contractAddress,
        chainId: task.chainId,
      },
      { status: 202 } // 202 Accepted - request accepted for processing
    );
  } catch (error) {
    console.error('Error queuing verification task:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to queue verification task',
        message: 'Unknown error',
      },
      { status: 500 }
    );
  }
}
