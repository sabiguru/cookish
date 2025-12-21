import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BookingStatusBadge from '@/components/dashboard/BookingStatusBadge';
import Link from 'next/link';
import { Eye, Settings } from 'lucide-react';

async function getBookings(searchParams: any) {
  try {
    const where: any = {};

    // Apply filters
    if (searchParams.status) {
      where.status = searchParams.status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        chef: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        menu: {
          select: {
            title: true,
          },
        },
        payment: {
          select: {
            amount: true,
            status: true,
          },
        },
        dispute: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    return bookings;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  const resolvedSearchParams = await searchParams;
  const bookings = await getBookings(resolvedSearchParams);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings Oversight</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all platform bookings</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <div className="flex gap-2">
                <Link href="/dashboard/admin/bookings">
                  <Badge
                    variant={!searchParams.status ? 'default' : 'outline'}
                    className="cursor-pointer rounded-full"
                  >
                    All
                  </Badge>
                </Link>
                {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
                  <Link key={status} href={`/dashboard/admin/bookings?status=${status}`}>
                    <Badge
                      variant={searchParams.status === status ? 'default' : 'outline'}
                      className="cursor-pointer rounded-full"
                    >
                      {status}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <CardTitle>All Bookings ({bookings.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {bookings.length > 0 ? (
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
                      Menu
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Guests
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Amount
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
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(booking.date, 'PP')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(booking.date, 'p')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.customer.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.customer.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {booking.chef.user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{booking.menu.title}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {booking.guests}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {booking.payment
                            ? formatCurrency(Number(booking.payment.amount))
                            : 'N/A'}
                        </div>
                        {booking.payment && (
                          <div className="text-xs text-gray-500">
                            {booking.payment.status}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <BookingStatusBadge status={booking.status} />
                          {booking.dispute && (
                            <Badge variant="destructive" className="text-xs rounded-full w-fit">
                              Dispute: {booking.dispute.status}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="rounded-lg"
                          >
                            <Link href={`/dashboard/user/bookings/${booking.id}`}>
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" className="rounded-lg">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No bookings found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
