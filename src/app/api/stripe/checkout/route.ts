import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const { customerId } = await request.json().catch(() => ({ customerId: null }));
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const priceId = process.env.STRIPE_PRO_PRICE_ID;

  if (!priceId) {
    return NextResponse.json({ error: 'Stripe price not configured' }, { status: 500 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}?checkout=cancelled`,
      ...(customerId ? { customer: customerId } : { customer_creation: 'always' }),
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create checkout session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
