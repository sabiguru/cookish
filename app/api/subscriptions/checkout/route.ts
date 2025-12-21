import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan } = body;

    if (!plan || !['BASIC', 'PRO', 'ELITE'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Basic plan is free, no checkout needed
    if (plan === 'BASIC') {
      return NextResponse.json(
        { error: 'Basic plan does not require checkout' },
        { status: 400 }
      );
    }

    const checkoutSession = await createCheckoutSession({
      userId: session.user.id,
      userEmail: session.user.email,
      plan: plan as 'BASIC' | 'PRO' | 'ELITE',
      successUrl: `${process.env.NEXTAUTH_URL}/dashboard/chef/subscription?success=true`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/dashboard/chef/subscription?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    );
  }
}
