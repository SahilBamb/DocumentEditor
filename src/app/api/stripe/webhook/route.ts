import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Signature verification failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(
        `[Stripe] Checkout completed — customer: ${session.customer}, subscription: ${session.subscription}`,
      );
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      console.log(
        `[Stripe] Subscription updated — customer: ${sub.customer}, status: ${sub.status}`,
      );
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      console.log(
        `[Stripe] Subscription deleted — customer: ${sub.customer}`,
      );
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
