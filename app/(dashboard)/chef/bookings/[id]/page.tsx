import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate, formatCurrency } from '@/lib/utils';
import BookingStatusBadge from '@/components/dashboard/BookingStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { MessageCircle, Calendar, MapPin, Users, CheckCircle, XCircle, Phone, Mail } from 'lucide-react';

async function getBookingDetails(bookingId: string, userId: string) {
  const chef = await prisma.chefProfile.findUnique({
    where: { userId },
  });

  if (!chef) {
    return null;
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      chefId: chef.id,
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          email: true,
          phone: true,
        },
      },
      menu: true,
      venue: {
        include: {
          address: true,
        },
      },
      payment: true,
      ingredients: true,
    },
  });

  return booking;
}

export default async function ChefBookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  const { id } = await params;
  const booking = await getBookingDetails(id, session.user.id);

  if (!booking) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
          <p className="text-gray-600 mt-1">Reference: {booking.id}</p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      {/* Action Buttons for Pending Bookings */}
      {booking.status === 'PENDING' && (
        <Card className="rounded-2xl shadow-md border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  New Booking Request
                </h3>
                <p className="text-sm text-gray-600">
                  Review the details and accept or reject this booking
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button className="rounded-xl bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Booking
                </Button>
                <Button variant="destructive" className="rounded-xl">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Info */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader className="border-b">
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(booking.date, 'PPP')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(booking.date, 'p')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Guests</p>
                    <p className="font-semibold text-gray-900">{booking.guests}</p>
                  </div>
                </div>

                {booking.venue && (
                  <div className="md:col-span-2 flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Venue</p>
                      <p className="text-gray-900">{booking.venue.address.line1}</p>
                      <p className="text-gray-900">
                        {booking.venue.address.city}, {booking.venue.address.postalCode}
                      </p>
                    </div>
                  </div>
                )}

                {booking.occasion && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Occasion</p>
                    <p className="text-gray-900">{booking.occasion}</p>
                  </div>
                )}

                {booking.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Special Requests</p>
                    <p className="text-gray-900">{booking.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Menu Details */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader className="border-b">
              <CardTitle>Menu</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {booking.menu.title}
              </h3>
              <p className="text-gray-600 mb-4">{booking.menu.description}</p>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600">Price per person</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(booking.menu.pricePerPerson)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          {booking.ingredients && booking.ingredients.length > 0 && (
            <Card className="rounded-2xl shadow-md">
              <CardHeader className="border-b">
                <CardTitle>Ingredient Procurement</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {booking.ingredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <span className="text-gray-900">{ingredient.name}</span>
                      <span className="text-sm text-gray-600">
                        {ingredient.payer === 'CHEF' ? 'You provide' :
                         ingredient.payer === 'USER' ? 'Customer provides' :
                         'Split cost'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Customer Card */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader className="border-b">
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={booking.user.image || undefined} />
                  <AvatarFallback>
                    {booking.user.name?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">
                    {booking.user.name}
                  </p>
                  <p className="text-sm text-gray-600">Customer</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                {booking.user.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{booking.user.email}</span>
                  </div>
                )}
                {booking.user.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{booking.user.phone}</span>
                  </div>
                )}
              </div>
              <Button asChild className="w-full rounded-xl">
                <Link href={`/messages?booking=${booking.id}`}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Customer
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          {booking.payment && (
            <Card className="rounded-2xl shadow-md">
              <CardHeader className="border-b">
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Menu</span>
                    <span className="font-semibold">
                      {formatCurrency(booking.menu.pricePerPerson * booking.guests)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(Number(booking.payment.amount))}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {booking.payment.status.toLowerCase()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
