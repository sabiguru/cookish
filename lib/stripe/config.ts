/**
 * Stripe configuration and subscription plans
 */

import Stripe from 'stripe';

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

/**
 * Subscription Plans Configuration
 */
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: 'Basic',
    price: 0,
    currency: 'GBP',
    interval: 'month',
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || '',
    features: [
      'Standard commission (20%)',
      'Normal search ranking',
      'Up to 5 menus',
      'Basic support',
    ],
    commission: 0.20,
    maxMenus: 5,
    priority: 0,
  },
  PRO: {
    name: 'Pro',
    price: 2900, // £29.00 in pence
    currency: 'GBP',
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
    features: [
      'Reduced commission (15%)',
      'Priority search ranking',
      'Unlimited menus',
      'Featured badge',
      'Analytics dashboard',
      'Priority support',
    ],
    commission: 0.15,
    maxMenus: null, // Unlimited
    priority: 1,
  },
  ELITE: {
    name: 'Elite',
    price: 5900, // £59.00 in pence
    currency: 'GBP',
    interval: 'month',
    stripePriceId: process.env.STRIPE_ELITE_PRICE_ID || '',
    features: [
      'Lowest commission (10%)',
      'Top search ranking',
      'All Pro features',
      'Marketing tools',
      'Dedicated support',
      'Featured on homepage',
    ],
    commission: 0.10,
    maxMenus: null, // Unlimited
    priority: 2,
  },
} as const;

export type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_PLANS;

/**
 * Get plan details by key
 */
export function getPlanDetails(plan: SubscriptionPlanKey) {
  return SUBSCRIPTION_PLANS[plan];
}

/**
 * Get commission rate for a plan
 */
export function getCommissionRate(plan: SubscriptionPlanKey): number {
  return SUBSCRIPTION_PLANS[plan].commission;
}

/**
 * Check if user can create more menus
 */
export function canCreateMenu(plan: SubscriptionPlanKey, currentMenuCount: number): boolean {
  const planDetails = SUBSCRIPTION_PLANS[plan];
  if (planDetails.maxMenus === null) {
    return true; // Unlimited
  }
  return currentMenuCount < planDetails.maxMenus;
}

/**
 * Get search ranking priority for a plan
 */
export function getSearchPriority(plan: SubscriptionPlanKey): number {
  return SUBSCRIPTION_PLANS[plan].priority;
}

/**
 * Format price for display
 */
export function formatPrice(amountInPence: number, currency: string = 'GBP'): string {
  const amount = amountInPence / 100;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Webhook event types to handle
 */
export const STRIPE_WEBHOOK_EVENTS = {
  CHECKOUT_COMPLETED: 'checkout.session.completed',
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  PAYMENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_FAILED: 'payment_intent.failed',
} as const;

/**
 * Map Stripe subscription status to our enum
 */
export function mapStripeStatus(stripeStatus: string): string {
  const statusMap: Record<string, string> = {
    active: 'ACTIVE',
    canceled: 'CANCELED',
    past_due: 'PAST_DUE',
    unpaid: 'UNPAID',
    trialing: 'TRIALING',
    incomplete: 'PAST_DUE',
    incomplete_expired: 'CANCELED',
  };

  return statusMap[stripeStatus] || 'CANCELED';
}

/**
 * Create checkout session for subscription
 */
export async function createCheckoutSession(params: {
  userId: string;
  userEmail: string;
  plan: SubscriptionPlanKey;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const planDetails = getPlanDetails(params.plan);

  const session = await stripe.checkout.sessions.create({
    customer_email: params.userEmail,
    client_reference_id: params.userId,
    line_items: [
      {
        price: planDetails.stripePriceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      userId: params.userId,
      plan: params.plan,
    },
  });

  return session;
}

/**
 * Create customer portal session
 */
export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });

  return session;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Reactivate subscription
 */
export async function reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}
