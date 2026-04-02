import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return NextResponse.json({
    id,
    message: 'Revision API - get endpoint',
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  if (body.action === 'restore') {
    return NextResponse.json({
      id: crypto.randomUUID(),
      parentRevisionId: id,
      summary: `Restored from revision ${id}`,
      createdAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
