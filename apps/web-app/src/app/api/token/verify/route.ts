import { NextRequest, NextResponse } from 'next/server';
import { createVerificationTask } from '@/lib/redis';
import { z } from 'zod';

const verificationRequestSchema = z.object({
  tx: z.string(),
  chainId: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = verificationRequestSchema.parse(body);

    // Create task in Redis and add to queue
    const task = await createVerificationTask({
      tx: validatedData.tx,
      chainId: validatedData.chainId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Verification task queued successfully',
        tx: task.tx,
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
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
