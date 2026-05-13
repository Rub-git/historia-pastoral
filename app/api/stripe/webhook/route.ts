import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

// Force Node.js runtime for Stripe webhooks
export const runtime = 'nodejs';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Plan limits mapping
const PLAN_LIMITS: Record<string, number> = {
  pastor: 100,
  team: 300,
  church: 999999,
};

// Team member limits by plan
const TEAM_LIMITS: Record<string, number> = {
  pastor: 0,   // No team members
  team: 3,     // 3 team members
  church: 10,  // 10 team members
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const stripe = getStripeClient();

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      // If webhook secret is not set, parse the event without verification (for testing)
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } else {
        event = JSON.parse(body) as Stripe.Event;
        console.warn('Webhook secret not set, skipping signature verification');
      }
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId || !planId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Save the new LIVE stripeCustomerId created by Stripe
  const customerId = session.customer as string;

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      subscriptionStatus: 'active',
      subscriptionPlan: planId,
      subscriptionId: session.subscription as string,
      maxMembers: PLAN_LIMITS[planId] || 100,
    },
  });

  console.log(`Subscription activated for user ${userId}, plan: ${planId}, customer: ${customerId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const planId = subscription.metadata?.planId || 'pastor';

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  let status: string;
  switch (subscription.status) {
    case 'active':
      status = 'active';
      break;
    case 'trialing':
      status = 'trialing';
      break;
    case 'past_due':
      status = 'past_due';
      break;
    case 'canceled':
    case 'unpaid':
      status = 'canceled';
      break;
    default:
      status = 'inactive';
  }

  // Access current_period_end from the subscription object
  const periodEnd = (subscription as any).current_period_end;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: status,
      subscriptionPlan: planId,
      subscriptionId: subscription.id,
      subscriptionEndDate: periodEnd
        ? new Date(periodEnd * 1000)
        : null,
      maxMembers: PLAN_LIMITS[planId] || 100,
      maxTeamMembers: TEAM_LIMITS[planId] || 0,
    },
  });

  console.log(`Subscription updated for user ${user.id}, status: ${status}`);
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'canceled',
      subscriptionEndDate: new Date(),
    },
  });

  console.log(`Subscription canceled for user ${user.id}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    return;
  }

  // Update subscription end date on successful payment
  const subscriptionId = (invoice as any).subscription;
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
    const periodEnd = (subscription as any).current_period_end;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'active',
        subscriptionEndDate: periodEnd ? new Date(periodEnd * 1000) : null,
      },
    });
  }

  console.log(`Payment succeeded for user ${user.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'past_due',
    },
  });

  console.log(`Payment failed for user ${user.id}`);
}
