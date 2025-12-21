import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function ChefDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const chefProfile = await prisma.chefProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!chefProfile) {
    redirect('/auth/chef-signup');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chef Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your chef profile and bookings</p>
      </div>

      {!chefProfile.verified && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-900">Application Under Review</AlertTitle>
          <AlertDescription className="text-amber-800">
            Your chef application is currently being reviewed by our admin team. You will be notified once your profile is approved and you can start receiving bookings.
          </AlertDescription>
        </Alert>
      )}

      {chefProfile.verified && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-900">Profile Verified</AlertTitle>
          <AlertDescription className="text-green-800">
            Your chef profile is live! Customers can now book you for their events.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-gray-600 text-sm font-semibold">Total Bookings</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-gray-600 text-sm font-semibold">Rating</h3>
          <p className="text-3xl font-bold mt-2">{chefProfile.avgRating?.toFixed(1) || 'N/A'}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="text-gray-600 text-sm font-semibold">Reviews</h3>
          <p className="text-3xl font-bold mt-2">{chefProfile.reviewsCount}</p>
        </div>
      </div>
    </div>
  );
}
