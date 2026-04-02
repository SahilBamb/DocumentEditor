import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const { sessionId } = await request.json().catch(() => ({ sessionId: null }));

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const customerId = typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id ?? null;

    return NextResponse.json({ customerId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
