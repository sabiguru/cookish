import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe/config';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: subscriptionId } = await params;

    // Get subscription from database
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (subscription.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Cancel in Stripe if it has a Stripe ID
    if (subscription.stripeSubId) {
      await stripe.subscriptions.update(subscription.stripeSubId, {
        cancel_at_period_end: true,
      });
    }

    // Update in database
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        actorId: session.user.id,
        entityType: 'SUBSCRIPTION',
        entityId: subscriptionId,
        action: 'CANCEL_SCHEDULED',
        message: `Subscription scheduled for cancellation`,
        severity: 'INFO',
        component: 'billing',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: error.message },
      { status: 500 }
    );
  }
}
