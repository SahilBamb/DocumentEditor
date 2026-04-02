import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const { customerId } = await request.json().catch(() => ({ customerId: null }));

  if (!customerId) {
    return NextResponse.json({ active: false, plan: null });
  }

  try {
    const subscriptions = await getStripe().subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ active: false, plan: null });
    }

    const sub = subscriptions.data[0];
    const priceId = sub.items.data[0]?.price?.id ?? null;
    const productId = sub.items.data[0]?.price?.product;
    let planName = 'Pro';

    if (typeof productId === 'string') {
      try {
        const product = await getStripe().products.retrieve(productId);
        planName = product.name || 'Pro';
      } catch {
        // fall back to "Pro"
      }
    }

    return NextResponse.json({
      active: true,
      plan: planName,
      priceId,
      currentPeriodEnd: (sub as unknown as Record<string, unknown>).current_period_end ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to check subscription';
    return NextResponse.json({ error: message, active: false, plan: null }, { status: 500 });
  }
}
