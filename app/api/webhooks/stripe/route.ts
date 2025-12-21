import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, STRIPE_WEBHOOK_EVENTS, mapStripeStatus } from '@/lib/stripe/config';
import { prisma } from '@/lib/prisma';
import type Stripe from 'stripe';

/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 *
 * Handles subscription lifecycle events from Stripe
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case STRIPE_WEBHOOK_EVENTS.CHECKOUT_COMPLETED:
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
      case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case STRIPE_WEBHOOK_EVENTS.INVOICE_PAID:
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case STRIPE_WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED:
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed
 * Creates initial subscription record
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId || session.client_reference_id;
  const plan = session.metadata?.plan as 'BASIC' | 'PRO' | 'ELITE';

  if (!userId) {
    console.error('No userId in checkout session metadata');
    return;
  }

  if (session.mode === 'subscription' && session.subscription) {
    // Fetch full subscription details
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    await upsertSubscription(userId, subscription, plan);

    // Log activity
    await prisma.activityLog.create({
      data: {
        actorId: userId,
        entityType: 'Subscription',
        entityId: subscription.id,
        action: 'CREATE',
        severity: 'INFO',
        component: 'billing',
        message: `Subscription created: ${plan}`,
        metadata: {
          plan,
          customerId: session.customer,
        },
      },
    });
  }
}

/**
 * Handle subscription.created and subscription.updated
 * Updates subscription record
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const plan = subscription.metadata?.plan as 'BASIC' | 'PRO' | 'ELITE';

  if (!userId) {
    // Try to find by stripeSubId
    const existing = await prisma.subscription.findUnique({
      where: { stripeSubId: subscription.id },
    });

    if (!existing) {
      console.error('Cannot find userId for subscription:', subscription.id);
      return;
    }

    await updateSubscriptionFromStripe(subscription);
    return;
  }

  await upsertSubscription(userId, subscription, plan);
}

/**
 * Handle subscription.deleted
 * Marks subscription as canceled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubId: subscription.id },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      entityType: 'Subscription',
      entityId: subscription.id,
      action: 'DELETE',
      severity: 'WARN',
      component: 'billing',
      message: 'Subscription canceled',
    },
  });
}

/**
 * Handle invoice.paid
 * Updates subscription status
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    );
    await updateSubscriptionFromStripe(subscription);
  }
}

/**
 * Handle invoice.payment_failed
 * Updates subscription status to past_due
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    await prisma.subscription.updateMany({
      where: { stripeSubId: invoice.subscription as string },
      data: {
        status: 'PAST_DUE',
        updatedAt: new Date(),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        entityType: 'Subscription',
        entityId: invoice.subscription as string,
        action: 'UPDATE',
        severity: 'ERROR',
        component: 'billing',
        message: 'Invoice payment failed',
        metadata: {
          invoiceId: invoice.id,
          amountDue: invoice.amount_due,
        },
      },
    });
  }
}

/**
 * Upsert subscription from Stripe data
 */
async function upsertSubscription(
  userId: string,
  subscription: Stripe.Subscription,
  plan?: 'BASIC' | 'PRO' | 'ELITE'
) {
  const status = mapStripeStatus(subscription.status);

  // Determine plan if not provided
  let subscriptionPlan = plan;
  if (!subscriptionPlan) {
    const existing = await prisma.subscription.findUnique({
      where: { stripeSubId: subscription.id },
    });
    subscriptionPlan = existing?.plan || 'BASIC';
  }

  await prisma.subscription.upsert({
    where: { stripeSubId: subscription.id },
    create: {
      userId,
      stripeSubId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      plan: subscriptionPlan,
      status: status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
    update: {
      status: status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      updatedAt: new Date(),
    },
  });
}

/**
 * Update subscription from Stripe subscription object
 */
async function updateSubscriptionFromStripe(subscription: Stripe.Subscription) {
  const status = mapStripeStatus(subscription.status);

  await prisma.subscription.updateMany({
    where: { stripeSubId: subscription.id },
    data: {
      status: status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      updatedAt: new Date(),
    },
  });
}
