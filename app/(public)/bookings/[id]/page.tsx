import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, Download, MessageCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      menu: true,
    },
  });

  if (!booking) {
    return {
      title: 'Booking Not Found',
    };
  }

  return {
    title: `Booking Confirmed - ${booking.menu.title}`,
    description: `Your booking for ${booking.menu.title} has been confirmed`,
  };
}

export default async function BookingConfirmationPage({ params }: PageProps) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      chef: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
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

  if (!booking) {
    notFound();
  }

  const ingredientCost = booking.ingredients.reduce((sum, item) => {
    // Simple calculation - in production, use proper pricing logic
    return sum + 5; // Placeholder cost per ingredient
  }, 0);

  const totalPaid = booking.payment?.amount
    ? parseFloat(booking.payment.amount.toString())
    : (booking.menu.pricePerPerson * booking.guests) + ingredientCost;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Your booking has been successfully confirmed. We've sent you a confirmation email.
          </p>
        </div>

        {/* Booking Summary Card */}
        <Card className="rounded-2xl shadow-md border-gray-200 mb-6">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Chef Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Chef
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={booking.chef.user.image || undefined} />
                    <AvatarFallback>
                      {booking.chef.user.name?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {booking.chef.user.name}
                    </p>
                    <p className="text-sm text-gray-500">Professional Chef</p>
                  </div>
                </div>
              </div>

              {/* Menu Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Menu
                </h3>
                <p className="font-semibold text-gray-900 text-lg">
                  {booking.menu.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {booking.menu.description}
                </p>
              </div>

              {/* Date & Time */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Date & Time
                </h3>
                <p className="font-semibold text-gray-900">
                  {formatDate(booking.date, 'PPPP')}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(booking.date, 'p')}
                </p>
              </div>

              {/* Guests */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Guests
                </h3>
                <p className="font-semibold text-gray-900 text-lg">
                  {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                </p>
              </div>

              {/* Venue */}
              {booking.venue && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                    Venue
                  </h3>
                  <p className="text-gray-900">
                    {booking.venue.address.line1}
                    {booking.venue.address.line2 && `, ${booking.venue.address.line2}`}
                  </p>
                  <p className="text-gray-900">
                    {booking.venue.address.city}, {booking.venue.address.postalCode}
                  </p>
                  <p className="text-gray-900">
                    {booking.venue.address.country}
                  </p>
                </div>
              )}

              {/* Occasion */}
              {booking.occasion && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                    Occasion
                  </h3>
                  <p className="text-gray-900">{booking.occasion}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card className="rounded-2xl shadow-md border-gray-200 mb-6">
          <CardHeader className="border-b">
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Menu ({booking.guests} guests × £{booking.menu.pricePerPerson})
                </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(booking.menu.pricePerPerson * booking.guests)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ingredient procurement</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(ingredientCost)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200 text-lg">
                <span className="font-bold text-gray-900">Total Paid</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(totalPaid)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-xl border-2 border-gray-300 hover:border-gray-400"
          >
            <Link href={`/messages?booking=${booking.id}`}>
              <MessageCircle className="w-5 h-5 mr-2" />
              Contact Chef
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-12 rounded-xl border-2 border-gray-300 hover:border-gray-400"
          >
            <Link href={`/dashboard/user/bookings/${booking.id}`}>
              <FileText className="w-5 h-5 mr-2" />
              View Details
            </Link>
          </Button>

          <Button
            variant="outline"
            className="h-12 rounded-xl border-2 border-gray-300 hover:border-gray-400"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Receipt
          </Button>
        </div>

        {/* Booking Reference */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Booking Reference: <span className="font-mono font-semibold">{booking.id}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
