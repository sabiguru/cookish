import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate, formatCurrency } from '@/lib/utils';
import BookingStatusBadge from '@/components/dashboard/BookingStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Eye, Clock, CheckCircle, XCircle } from 'lucide-react';

async function getChefBookings(userId: string) {
  const chef = await prisma.chefProfile.findUnique({
    where: { userId },
  });

  if (!chef) {
    return null;
  }

  const bookings = await prisma.booking.findMany({
    where: { chefId: chef.id },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      menu: {
        select: {
          title: true,
        },
      },
      payment: true,
      venue: {
        include: {
          address: true,
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  // Group bookings by status
  const grouped = {
    pending: bookings.filter((b) => b.status === 'PENDING'),
    confirmed: bookings.filter((b) => b.status === 'CONFIRMED'),
    completed: bookings.filter((b) => b.status === 'COMPLETED'),
    cancelled: bookings.filter((b) => b.status === 'CANCELLED'),
  };

  return grouped;
}

interface BookingCardProps {
  booking: any;
  showActions?: boolean;
}

function BookingCard({ booking, showActions = false }: BookingCardProps) {
  return (
    <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={booking.user.image || undefined} />
            <AvatarFallback>
              {booking.user.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">
              {booking.user.name}
            </h4>
            <p className="text-sm text-gray-600 truncate">{booking.menu.title}</p>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{formatDate(booking.date, 'PPP')}</span>
          </div>
          <div className="text-sm text-gray-600">
            {booking.guests} guests
          </div>
          {booking.payment && (
            <div className="text-sm font-semibold text-gray-900">
              {formatCurrency(Number(booking.payment.amount))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1 rounded-lg">
            <Link href={`/chef/bookings/${booking.id}`}>
              <Eye className="h-3 w-3 mr-1" />
              View
            </Link>
          </Button>
          {showActions && booking.status === 'PENDING' && (
            <>
              <Button size="sm" className="rounded-lg bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="rounded-lg"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Reject
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ChefBookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  const bookings = await getChefBookings(session.user.id);

  if (!bookings) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Chef profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Booking Pipeline</h1>
        <p className="text-gray-600 mt-1">Manage your booking requests and schedule</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* New Requests */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">New Requests</h2>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
              {bookings.pending.length}
            </span>
          </div>
          <div className="space-y-3">
            {bookings.pending.length > 0 ? (
              bookings.pending.map((booking) => (
                <BookingCard key={booking.id} booking={booking} showActions />
              ))
            ) : (
              <Card className="rounded-xl shadow-sm">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-500">No new requests</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Confirmed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Confirmed</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
              {bookings.confirmed.length}
            </span>
          </div>
          <div className="space-y-3">
            {bookings.confirmed.length > 0 ? (
              bookings.confirmed.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card className="rounded-xl shadow-sm">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-500">No confirmed bookings</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Completed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Completed</h2>
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
              {bookings.completed.length}
            </span>
          </div>
          <div className="space-y-3">
            {bookings.completed.length > 0 ? (
              bookings.completed.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card className="rounded-xl shadow-sm">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-500">No completed bookings</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Cancelled */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Cancelled</h2>
            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
              {bookings.cancelled.length}
            </span>
          </div>
          <div className="space-y-3">
            {bookings.cancelled.length > 0 ? (
              bookings.cancelled.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card className="rounded-xl shadow-sm">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-500">No cancelled bookings</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
