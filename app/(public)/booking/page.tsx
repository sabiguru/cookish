import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BookingForm from '@/components/booking/BookingForm';

export const metadata = {
  title: 'Book a Chef | CookFort',
  description: 'Book your perfect chef for an unforgettable dining experience',
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ chefId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = await searchParams;

  if (!session?.user?.id) {
    redirect(
      '/auth/signin?callbackUrl=/booking' +
        (resolvedSearchParams.chefId ? `?chefId=${resolvedSearchParams.chefId}` : '')
    );
  }

  // Fetch chef details if chefId is provided
  let chef = null;
  if (resolvedSearchParams.chefId) {
    chef = await prisma.chefProfile.findUnique({
      where: { id: resolvedSearchParams.chefId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        menus: {
          select: {
            id: true,
            title: true,
            description: true,
            pricePerPerson: true,
          },
        },
      },
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Book a Chef</h1>
          <p className="text-gray-600 mt-2">
            Fill out the details below to book your perfect dining experience
          </p>
        </div>

        <BookingForm chef={chef} userId={session.user.id} />
      </div>
    </div>
  );
}
