import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';

async function getChefPayouts(userId: string) {
  const chef = await prisma.chefProfile.findUnique({
    where: { userId },
  });

  if (!chef) {
    return null;
  }

  const [payouts, totalEarnings, pendingPayouts, completedPayouts] =
    await Promise.all([
      // All payouts
      prisma.payout.findMany({
        where: { chefUserId: userId },
        orderBy: { createdAt: 'desc' },
      }),

      // Total earnings
      prisma.payout.aggregate({
        where: {
          chefUserId: userId,
          status: 'SENT',
        },
        _sum: { amount: true },
      }),

      // Pending payouts
      prisma.payout.aggregate({
        where: {
          chefUserId: userId,
          status: 'PENDING',
        },
        _sum: { amount: true },
      }),

      // Completed payout count
      prisma.payout.count({
        where: {
          chefUserId: userId,
          status: 'SENT',
        },
      }),
    ]);

  return {
    payouts,
    totalEarnings: Number(totalEarnings._sum.amount || 0),
    pendingPayouts: Number(pendingPayouts._sum.amount || 0),
    completedPayouts,
  };
}

export default async function ChefPayoutsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  const data = await getChefPayouts(session.user.id);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Chef profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payouts & Earnings</h1>
        <p className="text-gray-600 mt-1">Track your earnings and payout history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Earnings"
          value={formatCurrency(data.totalEarnings)}
          icon={DollarSign}
          color="green"
        />
        <DashboardCard
          title="Pending Payouts"
          value={formatCurrency(data.pendingPayouts)}
          icon={Clock}
          color="orange"
        />
        <DashboardCard
          title="Sent Payouts"
          value={data.completedPayouts}
          icon={CheckCircle}
          color="blue"
        />
      </div>

      {/* Payout History */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.payouts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Method
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(payout.createdAt, 'PP')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(payout.createdAt, 'p')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(Number(payout.amount))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {payout.provider?.toLowerCase() || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            payout.status === 'SENT'
                              ? 'default'
                              : payout.status === 'PENDING' || payout.status === 'SCHEDULED'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className="text-xs rounded-full"
                        >
                          {payout.status.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500 font-mono">
                          {payout.id.slice(0, 8)}...
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No payouts yet
              </h3>
              <p className="text-gray-600">
                Complete bookings to start earning and receiving payouts
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Account Info */}
      <Card className="rounded-2xl shadow-md bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-2">
            Payout Information
          </h3>
          <p className="text-sm text-gray-600">
            Payouts are processed weekly on Fridays. Ensure your bank account
            information is up to date in your profile settings to avoid delays.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
