import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  Crown,
  Zap,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { SubscriptionUpgradeButton } from '@/components/chef/SubscriptionUpgradeButton';
import { CancelSubscriptionButton } from '@/components/chef/CancelSubscriptionButton';
import { formatDistanceToNow } from 'date-fns';

async function getSubscriptionData(userId: string) {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return subscription;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

export default async function ChefSubscriptionPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/auth/signin');
  }

  const subscription = await getSubscriptionData(session.user.id);
  const currentPlan = subscription?.plan || 'BASIC';
  const isActive = subscription?.status === 'ACTIVE';

  const plans = [
    {
      key: 'BASIC' as const,
      details: SUBSCRIPTION_PLANS.BASIC,
      icon: Check,
      color: 'gray',
      isCurrent: currentPlan === 'BASIC',
    },
    {
      key: 'PRO' as const,
      details: SUBSCRIPTION_PLANS.PRO,
      icon: Zap,
      color: 'blue',
      badge: 'Popular',
      isCurrent: currentPlan === 'PRO',
    },
    {
      key: 'ELITE' as const,
      details: SUBSCRIPTION_PLANS.ELITE,
      icon: Crown,
      color: 'purple',
      badge: 'Best Value',
      isCurrent: currentPlan === 'ELITE',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-gray-600 mt-1">
          Upgrade your plan to get more features and lower commission rates
        </p>
      </div>

      {/* Current Subscription Status */}
      {subscription && isActive && (
        <Card className="rounded-2xl shadow-md border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Active Subscription
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  You're currently on the <span className="font-semibold">{currentPlan}</span> plan
                </p>
                {subscription.currentPeriodEnd && (
                  <p className="text-xs text-gray-500 mt-1">
                    Renews {formatDistanceToNow(new Date(subscription.currentPeriodEnd), { addSuffix: true })}
                  </p>
                )}
              </div>
              {currentPlan !== 'BASIC' && subscription.stripeSubId && (
                <CancelSubscriptionButton subscriptionId={subscription.id} />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancellation Warning */}
      {subscription && subscription.cancelAtPeriodEnd && (
        <Card className="rounded-2xl shadow-md border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Subscription Scheduled for Cancellation
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your subscription will be canceled on{' '}
                  {subscription.currentPeriodEnd &&
                    new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  . You'll still have access to your current plan until then.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Comparison */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isUpgrade =
            (currentPlan === 'BASIC' && plan.key !== 'BASIC') ||
            (currentPlan === 'PRO' && plan.key === 'ELITE');

          return (
            <Card
              key={plan.key}
              className={`rounded-2xl shadow-md transition-all hover:shadow-lg ${
                plan.isCurrent
                  ? 'border-2 border-blue-500 scale-105'
                  : 'border-gray-200'
              }`}
            >
              <CardHeader
                className={`border-b ${
                  plan.color === 'blue'
                    ? 'bg-blue-50'
                    : plan.color === 'purple'
                    ? 'bg-purple-50'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Icon
                        className={`h-6 w-6 ${
                          plan.color === 'blue'
                            ? 'text-blue-600'
                            : plan.color === 'purple'
                            ? 'text-purple-600'
                            : 'text-gray-600'
                        }`}
                      />
                      {plan.details.name}
                    </CardTitle>
                    {plan.isCurrent && (
                      <Badge className="mt-2 bg-blue-600 text-white">
                        Current Plan
                      </Badge>
                    )}
                    {!plan.isCurrent && plan.badge && (
                      <Badge variant="secondary" className="mt-2">
                        {plan.badge}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Pricing */}
                <div>
                  <div className="text-4xl font-bold text-gray-900">
                    £{(plan.details.price / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    per {plan.details.interval}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.details.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <div>
                  {plan.isCurrent && isActive ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : isUpgrade ? (
                    <SubscriptionUpgradeButton
                      planKey={plan.key}
                      planName={plan.details.name}
                      currentPlan={currentPlan}
                    />
                  ) : currentPlan === plan.key && !isActive ? (
                    <SubscriptionUpgradeButton
                      planKey={plan.key}
                      planName={plan.details.name}
                      currentPlan="BASIC"
                    />
                  ) : (
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      {currentPlan === 'PRO' && plan.key === 'BASIC'
                        ? 'Downgrade Not Available'
                        : 'Not Available'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Benefits Comparison Table */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <CardTitle>Plan Benefits Comparison</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Feature
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Basic
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Pro
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Elite
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    Platform Commission
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    20%
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    15%
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    10%
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    Number of Menus
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    Up to 5
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    Unlimited
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    Search Ranking
                  </td>
                  <td className="px-6 py-4 text-center">
                    <X className="h-4 w-4 text-red-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    Featured Badge
                  </td>
                  <td className="px-6 py-4 text-center">
                    <X className="h-4 w-4 text-red-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    Analytics Dashboard
                  </td>
                  <td className="px-6 py-4 text-center">
                    <X className="h-4 w-4 text-red-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    Priority Support
                  </td>
                  <td className="px-6 py-4 text-center">
                    <X className="h-4 w-4 text-red-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    Advanced Analytics
                  </td>
                  <td className="px-6 py-4 text-center">
                    <X className="h-4 w-4 text-red-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <X className="h-4 w-4 text-red-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    Dedicated Account Manager
                  </td>
                  <td className="px-6 py-4 text-center">
                    <X className="h-4 w-4 text-red-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <X className="h-4 w-4 text-red-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-4 w-4 text-green-600 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">
              Can I cancel my subscription at any time?
            </h4>
            <p className="text-sm text-gray-600">
              Yes, you can cancel your subscription at any time. You'll continue to have
              access to your current plan until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">
              What happens when I upgrade?
            </h4>
            <p className="text-sm text-gray-600">
              When you upgrade, you'll be charged a prorated amount for the remainder of
              your current billing period, and your new benefits will be activated immediately.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">
              How is the commission calculated?
            </h4>
            <p className="text-sm text-gray-600">
              The commission is calculated as a percentage of each booking's total amount.
              Lower commission rates mean you keep more of your earnings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
