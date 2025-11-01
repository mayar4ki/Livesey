import { NextRequest, NextResponse } from 'next/server';
import { getVerificationTask } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contractAddress = searchParams.get('contractAddress');
    const chainId = searchParams.get('chainId');
    if (!contractAddress || !chainId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: contractAddress or chainId',
        },
        { status: 400 }
      );
    }

    const task = await getVerificationTask(Number(chainId), contractAddress as `0x${string}`);

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
        message: 'Unknown error',
      },
      { status: 500 }
    );
  }
}
