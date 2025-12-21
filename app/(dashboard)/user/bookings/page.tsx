import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import BookingStatusBadge from '@/components/dashboard/BookingStatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye, X } from 'lucide-react';

async function getBookings(userId: string, status?: string) {
  const where: any = { userId: userId };
  
  if (status && status !== 'all') {
    where.status = status.toUpperCase();
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
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
    },
    orderBy: {
      date: 'desc',
    },
  });

  return bookings;
}

export default async function UserBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return null;
  }

  const resolvedSearchParams = await searchParams;
  const bookings = await getBookings(session.user.id, resolvedSearchParams.status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600 mt-1">Manage your chef bookings</p>
      </div>

      <Tabs defaultValue={resolvedSearchParams.status || 'all'} className="space-y-6">
        <TabsList className="bg-white shadow-sm rounded-xl p-1">
          <TabsTrigger value="all" asChild>
            <Link href="/user/bookings?status=all" className="rounded-lg px-6">
              All
            </Link>
          </TabsTrigger>
          <TabsTrigger value="pending" asChild>
            <Link href="/user/bookings?status=pending" className="rounded-lg px-6">
              Pending
            </Link>
          </TabsTrigger>
          <TabsTrigger value="confirmed" asChild>
            <Link href="/user/bookings?status=confirmed" className="rounded-lg px-6">
              Confirmed
            </Link>
          </TabsTrigger>
          <TabsTrigger value="completed" asChild>
            <Link href="/user/bookings?status=completed" className="rounded-lg px-6">
              Completed
            </Link>
          </TabsTrigger>
        </TabsList>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
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
                  Menu
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Guests
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(booking.date, 'PP')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(booking.date, 'p')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.chef.user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{booking.menu.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{booking.guests}</div>
                  </td>
                  <td className="px-6 py-4">
                    <BookingStatusBadge status={booking.status} />
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="rounded-lg"
                    >
                      <Link href={`/user/bookings/${booking.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    {booking.status === 'PENDING' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No bookings found</p>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
