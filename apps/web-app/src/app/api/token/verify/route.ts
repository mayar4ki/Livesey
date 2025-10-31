import { NextRequest, NextResponse } from 'next/server';
import { createVerificationTask } from '@/lib/redis';
import { z } from 'zod';

const verificationRequestSchema = z.object({
    contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid contract address'),
    chainId: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = verificationRequestSchema.parse(body);

        // Create task in Redis and add to queue
        const task = await createVerificationTask({
            contractAddress: validatedData.contractAddress,
            chainId: validatedData.chainId
        });

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
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

