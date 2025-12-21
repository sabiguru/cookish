import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardCard from '@/components/dashboard/DashboardCard';
import BookingStatusBadge from '@/components/dashboard/BookingStatusBadge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Calendar, DollarSign, Heart, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getDashboardData(userId: string) {
  try {
    const [bookings, favourites, totalSpent] = await Promise.all([
      prisma.booking.findMany({
        where: { userId: userId },
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
        take: 5,
      }),
      prisma.favourite.count({
        where: { userId },
      }),
      prisma.payment.aggregate({
        where: {
          userId: userId,
          status: 'PAID',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const upcomingBookings = bookings.filter(
      (b) => new Date(b.date) > new Date() && b.status !== 'CANCELLED'
    );

    return {
      upcomingBookingsCount: upcomingBookings.length,
      totalSpent: totalSpent._sum.amount || 0,
      favouritesCount: favourites,
      recentBookings: bookings,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      upcomingBookingsCount: 0,
      totalSpent: 0,
      favouritesCount: 0,
      recentBookings: [],
    };
  }
}

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return null;
  }

  const data = await getDashboardData(session.user.id);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session.user.name || session.user.email?.split('@')[0] || 'User'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your bookings
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Upcoming Bookings"
          value={data.upcomingBookingsCount}
          icon={Calendar}
          color="blue"
        />
        <DashboardCard
          title="Total Spent"
          value={formatCurrency(Number(data.totalSpent))}
          icon={DollarSign}
          color="green"
        />
        <DashboardCard
          title="Favourite Chefs"
          value={data.favouritesCount}
          icon={Heart}
          color="purple"
        />
        <DashboardCard
          title="Pending Disputes"
          value={0}
          icon={AlertCircle}
          color="orange"
        />
      </div>

      {/* Recent Bookings */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Button asChild variant="ghost">
              <Link href="/user/bookings">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {data.recentBookings.length > 0 ? (
            <div className="space-y-4">
              {data.recentBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/user/bookings/${booking.id}`}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {booking.menu.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Chef: {booking.chef.user.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(booking.date, 'PPP')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {booking.guests} guests
                      </p>
                    </div>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No bookings yet</p>
              <Button asChild>
                <Link href="/chefs">Find a Chef</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
