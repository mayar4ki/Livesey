import { NextRequest, NextResponse } from 'next/server';
import { getVerificationTask } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tx = searchParams.get('tx');
    const chainId = searchParams.get('chainId');
    if (!tx || !chainId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: tx or chainId',
        },
        { status: 400 }
      );
    }

    const task = await getVerificationTask(Number(chainId), tx);

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
      task,
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
