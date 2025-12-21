import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, AlertCircle, DollarSign, TrendingUp } from 'lucide-react';

async function getAdminDashboardData() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      newChefApplications,
      activeBookings,
      openDisputes,
      pendingRefunds,
      revenue,
      bookingsCount,
    ] = await Promise.all([
      // New chef applications (chefs created in last 7 days without verified status)
      prisma.chef.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          user: {
            emailVerified: null,
          },
        },
      }),

      // Active bookings (confirmed or pending)
      prisma.booking.count({
        where: {
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
        },
      }),

      // Open disputes
      prisma.dispute.count({
        where: {
          status: {
            in: ['OPEN', 'UNDER_REVIEW'],
          },
        },
      }),

      // Pending refunds
      prisma.refund.count({
        where: {
          status: 'PENDING',
        },
      }),

      // Revenue (last 30 days)
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      // Total bookings (last 30 days)
      prisma.booking.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
    ]);

    return {
      newChefApplications,
      activeBookings,
      openDisputes,
      pendingRefunds,
      revenue: Number(revenue._sum.amount || 0),
      bookingsCount,
    };
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return {
      newChefApplications: 0,
      activeBookings: 0,
      openDisputes: 0,
      pendingRefunds: 0,
      revenue: 0,
      bookingsCount: 0,
    };
  }
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  const data = await getAdminDashboardData();

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Platform overview and management</p>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="New Chef Applications"
          value={data.newChefApplications}
          icon={Users}
          color="blue"
          trend={
            data.newChefApplications > 0
              ? { value: data.newChefApplications, isPositive: true }
              : undefined
          }
        />
        <DashboardCard
          title="Active Bookings"
          value={data.activeBookings}
          icon={Calendar}
          color="green"
        />
        <DashboardCard
          title="Open Disputes"
          value={data.openDisputes}
          icon={AlertCircle}
          color="orange"
          trend={
            data.openDisputes > 0
              ? { value: data.openDisputes, isPositive: false }
              : undefined
          }
        />
        <DashboardCard
          title="Pending Refunds"
          value={data.pendingRefunds}
          icon={DollarSign}
          color="purple"
        />
        <DashboardCard
          title="Revenue (30d)"
          value={formatCurrency(data.revenue)}
          icon={TrendingUp}
          color="green"
        />
        <DashboardCard
          title="Bookings (30d)"
          value={data.bookingsCount}
          icon={Calendar}
          color="blue"
        />
      </div>

      {/* System Status */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Database</p>
                <p className="text-xs text-gray-600">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-semibold text-gray-900">API</p>
                <p className="text-xs text-gray-600">Healthy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                <p className="text-xs text-gray-600">Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/dashboard/admin/chefs"
              className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Users className="h-6 w-6 text-blue-600 mb-2" />
              <p className="font-semibold text-gray-900">Review Chefs</p>
              <p className="text-sm text-gray-600">
                {data.newChefApplications} pending
              </p>
            </a>
            <a
              href="/dashboard/admin/disputes"
              className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <AlertCircle className="h-6 w-6 text-orange-600 mb-2" />
              <p className="font-semibold text-gray-900">Handle Disputes</p>
              <p className="text-sm text-gray-600">{data.openDisputes} open</p>
            </a>
            <a
              href="/dashboard/admin/payments"
              className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <DollarSign className="h-6 w-6 text-green-600 mb-2" />
              <p className="font-semibold text-gray-900">Process Refunds</p>
              <p className="text-sm text-gray-600">
                {data.pendingRefunds} pending
              </p>
            </a>
            <a
              href="/dashboard/admin/catalog"
              className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="h-6 w-6 text-purple-600 mb-2" />
              <p className="font-semibold text-gray-900">Manage Catalog</p>
              <p className="text-sm text-gray-600">Cuisines & Tags</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
