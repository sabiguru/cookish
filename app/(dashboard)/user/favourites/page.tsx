import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ChefCard from '@/components/cards/ChefCard';
import { Heart } from 'lucide-react';

async function getFavourites(userId: string) {
  const favourites = await prisma.favourite.findMany({
    where: { userId },
    include: {
      chef: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
          cuisines: {
            include: {
              cuisine: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      },
    },
  });

  return favourites.map((fav) => {
    const avgRating = fav.chef.reviews.length > 0
      ? fav.chef.reviews.reduce((sum, r) => sum + r.rating, 0) / fav.chef.reviews.length
      : 0;

    return {
      id: fav.chef.id,
      name: fav.chef.user.name || 'Chef',
      image: fav.chef.user.image,
      bio: fav.chef.bio,
      cuisines: fav.chef.cuisines.map((c) => c.cuisine.name),
      avgPricePerPerson: fav.chef.avgPricePerPerson,
      rating: avgRating,
      totalReviews: fav.chef.reviews.length,
      verified: fav.chef.verified,
    };
  });
}

export default async function FavouritesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return null;
  }

  const favourites = await getFavourites(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Favourite Chefs</h1>
        <p className="text-gray-600 mt-1">
          {favourites.length} {favourites.length === 1 ? 'chef' : 'chefs'} saved
        </p>
      </div>

      {favourites.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.map((chef) => (
            <ChefCard key={chef.id} {...chef} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl shadow-md">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No favourites yet
          </h3>
          <p className="text-gray-600">
            Start adding chefs to your favourites to see them here
          </p>
        </div>
      )}
    </div>
  );
}
