import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Package, ShoppingCart, CheckCircle, Clock } from 'lucide-react';

async function getChefProcurementOrders(userId: string) {
  try {
    const chef = await prisma.chefProfile.findUnique({
      where: { userId },
    });

    if (!chef) {
      return null;
    }

    const orders = await prisma.procurementOrder.findMany({
      where: {
        booking: {
          chefId: chef.id,
        },
      },
      include: {
        retailer: true,
        booking: {
          select: {
            id: true,
            date: true,
          },
        },
        items: {
          include: {
            bookingIngredient: {
              include: {
                ingredient: true,
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders;
  } catch (error) {
    console.error('Error fetching procurement orders:', error);
    return [];
  }
}

export default async function ChefProcurementPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  const orders = await getChefProcurementOrders(session.user.id);

  if (!orders) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Chef profile not found</p>
      </div>
    );
  }

  const statusCounts = {
    draft: orders.filter((o) => o.status === 'DRAFT').length,
    placed: orders.filter((o) => o.status === 'PLACED').length,
    delivered: orders.filter((o) => o.status === 'DELIVERED').length,
    reconciled: orders.filter((o) => o.status === 'RECONCILED').length,
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Procurement Orders</h1>
          <p className="text-gray-600 mt-1">Manage ingredient orders and shopping lists</p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/chef/procurement/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Link>
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.draft}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Placed</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.placed}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.delivered}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reconciled</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.reconciled}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/chef/procurement/${order.id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <Package className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {order.retailer?.name || 'Order'} - #{order.id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {order._count.items} items • {order.orderType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          order.status === 'RECONCILED'
                            ? 'default'
                            : order.status === 'DELIVERED'
                            ? 'default'
                            : order.status === 'PLACED'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="rounded-full"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">
                        Created: {formatDate(order.createdAt, 'PP')}
                      </span>
                      {order.eta && (
                        <span className="text-gray-600">
                          ETA: {formatDate(order.eta, 'PP')}
                        </span>
                      )}
                    </div>
                    {order.total && (
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(Number(order.total))}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No procurement orders yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first order to manage ingredient procurement
              </p>
              <Button asChild className="rounded-xl">
                <Link href="/chef/procurement/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="rounded-2xl shadow-md bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-2">
            Procurement Workflow
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <strong>Draft:</strong> Create and organize your shopping list
            </p>
            <p>
              <strong>Placed:</strong> Order placed with retailer
            </p>
            <p>
              <strong>Delivered:</strong> Items received, upload receipt for reconciliation
            </p>
            <p>
              <strong>Reconciled:</strong> Costs verified and payment processed
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
