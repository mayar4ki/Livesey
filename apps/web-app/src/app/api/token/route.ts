import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const payload = await request.json();
  console.log('Token create payload:', payload);
  return NextResponse.json(payload);
}
