import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const { customerId } = await request.json().catch(() => ({ customerId: null }));
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: appUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create portal session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
