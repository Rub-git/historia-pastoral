import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { getStripeClient } from '@/lib/stripe';

// Force Node.js runtime for Stripe
export const runtime = 'nodejs';

// APP_URL must be set in environment
const APP_URL = process.env.APP_URL;

// Price IDs for each plan
const PLAN_PRICES: Record<string, { priceId: string | undefined; maxMembers: number }> = {
  pastor: {
    priceId: process.env.STRIPE_PRICE_PASTOR,
    maxMembers: 100,
  },
  team: {
    priceId: process.env.STRIPE_PRICE_TEAM,
    maxMembers: 300,
  },
  church: {
    priceId: process.env.STRIPE_PRICE_CHURCH,
    maxMembers: 999999,
  },
};

export async function POST(req: NextRequest) {
  try {
    console.log('Stripe checkout: Starting...');
    console.log('APP_URL:', APP_URL);
    
    // Validate APP_URL is set
    if (!APP_URL) {
      console.error('APP_URL is not defined in environment');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user?.email);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await req.json();
    console.log('Plan ID:', planId);
    
    if (!planId || !PLAN_PRICES[planId]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const priceId = PLAN_PRICES[planId].priceId;
    console.log('Price ID:', priceId);
    
    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured' }, { status: 500 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const stripe = getStripeClient();

    // Create checkout session with customer_email
    // Let Stripe create the customer automatically in LIVE mode
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/pricing`,
      metadata: {
        userId: user.id,
        planId: planId,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: planId,
        },
      },
    });

    console.log('Checkout session created:', checkoutSession.id);
    console.log('Checkout URL:', checkoutSession.url);
    
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    console.error('Error message:', error?.message);
    console.error('Error type:', error?.type);
    return NextResponse.json(
      { error: error?.message || 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
