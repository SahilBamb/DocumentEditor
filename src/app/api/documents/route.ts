import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    documents: [],
    message: 'Document API - list endpoint',
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json(
    {
      id: crypto.randomUUID(),
      title: body.title ?? 'Untitled Document',
      createdAt: new Date().toISOString(),
    },
    { status: 201 },
  );
}
