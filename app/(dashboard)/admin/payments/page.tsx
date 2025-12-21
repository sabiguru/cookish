import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

async function getPaymentsData() {
  try {
    const [payments, payouts, refunds] = await Promise.all([
      // Recent payments
      prisma.payment.findMany({
        include: {
          booking: {
            include: {
              customer: {
                select: { name: true },
              },
              chef: {
                include: {
                  user: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),

      // Recent payouts
      prisma.payout.findMany({
        include: {
          chef: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),

      // Pending refunds
      prisma.refund.findMany({
        include: {
          booking: {
            include: {
              customer: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { payments, payouts, refunds };
  } catch (error) {
    console.error('Error fetching payments data:', error);
    return { payments: [], payouts: [], refunds: [] };
  }
}

export default async function AdminPaymentsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  const data = await getPaymentsData();

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payments & Payouts</h1>
        <p className="text-gray-600 mt-1">Manage platform transactions and refunds</p>
      </div>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="rounded-xl">
          <TabsTrigger value="payments" className="rounded-lg">
            Payments ({data.payments.length})
          </TabsTrigger>
          <TabsTrigger value="payouts" className="rounded-lg">
            Payouts ({data.payouts.length})
          </TabsTrigger>
          <TabsTrigger value="refunds" className="rounded-lg">
            Refunds ({data.refunds.length})
          </TabsTrigger>
        </TabsList>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card className="rounded-2xl shadow-md">
            <CardHeader className="border-b">
              <CardTitle>All Payments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Customer
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Chef
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
                          Transaction ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(payment.createdAt, 'PP')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {payment.booking.customer.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {payment.booking.chef.user.name}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {formatCurrency(Number(payment.amount))}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                            {payment.method || 'Card'}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={
                                payment.status === 'COMPLETED'
                                  ? 'default'
                                  : payment.status === 'PENDING'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                              className="rounded-full"
                            >
                              {payment.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                            {payment.providerPaymentId || payment.id.slice(0, 8)}...
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No payments found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts">
          <Card className="rounded-2xl shadow-md">
            <CardHeader className="border-b">
              <CardTitle>Chef Payouts</CardTitle>
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
                          Chef
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
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.payouts.map((payout) => (
                        <tr key={payout.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(payout.createdAt, 'PP')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {payout.chef.user.name}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {formatCurrency(Number(payout.amount))}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                            {payout.paymentMethod || 'Bank Transfer'}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={
                                payout.status === 'COMPLETED'
                                  ? 'default'
                                  : payout.status === 'PENDING'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                              className="rounded-full"
                            >
                              {payout.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            {payout.status === 'FAILED' && (
                              <Button size="sm" variant="outline" className="rounded-lg">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Retry
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No payouts found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refunds Tab */}
        <TabsContent value="refunds">
          <Card className="rounded-2xl shadow-md">
            <CardHeader className="border-b">
              <CardTitle>Refund Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {data.refunds.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Customer
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Reason
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.refunds.map((refund) => (
                        <tr key={refund.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(refund.createdAt, 'PP')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {refund.booking.customer.name}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {formatCurrency(Number(refund.amount))}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {refund.reason || 'Not specified'}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={
                                refund.status === 'COMPLETED'
                                  ? 'default'
                                  : refund.status === 'PENDING'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                              className="rounded-full"
                            >
                              {refund.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            {refund.status === 'PENDING' && (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  className="rounded-lg bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="rounded-lg"
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Decline
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No refund requests</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
