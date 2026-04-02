import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return NextResponse.json({
    id,
    message: 'Change set API - get endpoint',
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { action } = body;

  return NextResponse.json({
    id,
    action,
    status: action === 'accept-all' ? 'approved' : action === 'reject-all' ? 'rejected' : 'updated',
    updatedAt: new Date().toISOString(),
  });
}
