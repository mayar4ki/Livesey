import { NextRequest, NextResponse } from 'next/server';
import { getVerificationTask } from '@/lib/redis';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const contractAddress = searchParams.get('contractAddress');

        if (!contractAddress) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required parameter: contractAddress',
                },
                { status: 400 }
            );
        }

        const task = await getVerificationTask(contractAddress);

        if (!task) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Verification task not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            task: {
                id: task.id,
                contractAddress: task.contractAddress,
                chainId: task.chainId,
                status: task.status, // 'pending' | 'processing' | 'completed' | 'failed'
                errorMessage: task.errorMessage,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt,
                completedAt: task.completedAt,
            },
        });
    } catch (error) {
        console.error('Error fetching verification status:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch verification status',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

