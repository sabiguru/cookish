import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  AlertCircle,
  TrendingDown,
} from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { SubscriptionsList } from '@/components/admin/SubscriptionsList';
import { RevenueChart } from '@/components/admin/RevenueChart';

async function getBillingData() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Get all active subscriptions
    const [
      activeSubscriptions,
      canceledSubscriptions,
      proSubscribers,
      eliteSubscribers,
      subscriptions,
      revenueData,
    ] = await Promise.all([
      // Active subscriptions count
      prisma.subscription.count({
        where: { status: 'ACTIVE' },
      }),

      // Canceled subscriptions (last 30 days)
      prisma.subscription.count({
        where: {
          status: 'CANCELED',
          canceledAt: { gte: thirtyDaysAgo },
        },
      }),

      // Pro subscribers
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          plan: 'PRO',
        },
      }),

      // Elite subscribers
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          plan: 'ELITE',
        },
      }),

      // Recent subscriptions for list
      prisma.subscription.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),

      // Revenue data (last 30 days by week)
      Promise.all(
        Array.from({ length: 4 }, async (_, i) => {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
          const weekEnd = new Date();
          weekEnd.setDate(weekEnd.getDate() - i * 7);

          const weeklyRevenue = await prisma.subscription.findMany({
            where: {
              status: 'ACTIVE',
              createdAt: {
                gte: weekStart,
                lt: weekEnd,
              },
            },
            select: { plan: true },
          });

          const revenue = weeklyRevenue.reduce((sum, sub) => {
            if (sub.plan === 'PRO') return sum + 2900;
            if (sub.plan === 'ELITE') return sum + 5900;
            return sum;
          }, 0);

          return {
            week: `Week ${4 - i}`,
            revenue: revenue / 100, // Convert pence to pounds
          };
        })
      ),
    ]);

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = (proSubscribers * 2900 + eliteSubscribers * 5900) / 100;

    // Calculate churn rate
    const totalSubscribers = activeSubscriptions + canceledSubscriptions;
    const churnRate =
      totalSubscribers > 0
        ? (canceledSubscriptions / totalSubscribers) * 100
        : 0;

    return {
      activeSubscriptions,
      canceledSubscriptions,
      proSubscribers,
      eliteSubscribers,
      mrr,
      churnRate,
      subscriptions,
      revenueData: revenueData.reverse(), // Oldest to newest
    };
  } catch (error) {
    console.error('Error fetching billing data:', error);
    return {
      activeSubscriptions: 0,
      canceledSubscriptions: 0,
      proSubscribers: 0,
      eliteSubscribers: 0,
      mrr: 0,
      churnRate: 0,
      subscriptions: [],
      revenueData: [],
    };
  }
}

export default async function AdminBillingPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  const data = await getBillingData();

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscriptions</h1>
        <p className="text-gray-600 mt-1">
          Manage chef subscriptions and track revenue
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Active Subscriptions"
          value={data.activeSubscriptions}
          icon={Users}
          color="blue"
          subtitle={`${data.proSubscribers} Pro, ${data.eliteSubscribers} Elite`}
        />
        <DashboardCard
          title="Monthly Recurring Revenue"
          value={formatCurrency(data.mrr)}
          icon={DollarSign}
          color="green"
          trend={{
            value: data.mrr > 0 ? `+${data.mrr.toFixed(0)}` : '0',
            isPositive: true,
          }}
        />
        <DashboardCard
          title="Churn Rate (30d)"
          value={`${data.churnRate.toFixed(1)}%`}
          icon={data.churnRate > 5 ? TrendingDown : TrendingUp}
          color={data.churnRate > 5 ? 'red' : 'green'}
          subtitle={`${data.canceledSubscriptions} cancellations`}
        />
        <DashboardCard
          title="Revenue per User"
          value={
            data.activeSubscriptions > 0
              ? formatCurrency(data.mrr / data.activeSubscriptions)
              : '£0.00'
          }
          icon={CreditCard}
          color="purple"
        />
      </div>

      {/* Revenue Chart */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <CardTitle>Revenue Trend (Last 4 Weeks)</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {data.revenueData.length > 0 ? (
            <RevenueChart data={data.revenueData} />
          ) : (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <AlertCircle className="h-5 w-5 mr-2" />
              No revenue data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Breakdown */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="rounded-2xl shadow-md">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="text-base">Basic Plan</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900">
                {data.activeSubscriptions - data.proSubscribers - data.eliteSubscribers}
              </div>
              <p className="text-sm text-gray-600">Active subscribers</p>
              <div className="pt-4 border-t">
                <p className="text-sm font-semibold text-gray-900">£0.00/month</p>
                <p className="text-xs text-gray-600">20% commission</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md border-blue-200">
          <CardHeader className="border-b bg-blue-50">
            <CardTitle className="text-base text-blue-700">Pro Plan</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-700">
                {data.proSubscribers}
              </div>
              <p className="text-sm text-gray-600">Active subscribers</p>
              <div className="pt-4 border-t">
                <p className="text-sm font-semibold text-gray-900">£29.00/month</p>
                <p className="text-xs text-gray-600">15% commission</p>
                <p className="text-xs text-blue-600 mt-1">
                  MRR: {formatCurrency((data.proSubscribers * 2900) / 100)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md border-purple-200">
          <CardHeader className="border-b bg-purple-50">
            <CardTitle className="text-base text-purple-700">Elite Plan</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-700">
                {data.eliteSubscribers}
              </div>
              <p className="text-sm text-gray-600">Active subscribers</p>
              <div className="pt-4 border-t">
                <p className="text-sm font-semibold text-gray-900">£59.00/month</p>
                <p className="text-xs text-gray-600">10% commission</p>
                <p className="text-xs text-purple-600 mt-1">
                  MRR: {formatCurrency((data.eliteSubscribers * 5900) / 100)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Subscriptions */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <CardTitle>Recent Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <SubscriptionsList subscriptions={data.subscriptions} />
        </CardContent>
      </Card>
    </div>
  );
}
