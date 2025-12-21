import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import ChefCard from '@/components/cards/ChefCard';
import FilterBar from '@/components/filters/FilterBar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, MapPin, Grid3x3, Map } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find a Chef — CookFort',
  description: 'Browse verified professional chefs in your area. Filter by cuisine, price, rating, and more.',
};

interface SearchParams {
  cuisine?: string;
  price?: string;
  rating?: string;
  occasion?: string;
  distance?: string;
  sort?: string;
  page?: string;
}

async function getCuisines() {
  try {
    const cuisines = await prisma.cuisine.findMany({
      orderBy: { name: 'asc' },
    });
    return cuisines;
  } catch {
    return [];
  }
}

async function getChefs(params: SearchParams) {
  try {
    const page = parseInt(params.page || '1', 10);
    const pageSize = 12;
    const skip = (page - 1) * pageSize;

    // Build where clause based on filters
    const where: any = {
      verified: true,
    };

    // Cuisine filter
    if (params.cuisine) {
      where.cuisines = {
        some: {
          cuisine: {
            slug: params.cuisine,
          },
        },
      };
    }

    // Price filter
    if (params.price) {
      if (params.price === 'low') {
        where.avgPricePerPerson = { lt: 50 };
      } else if (params.price === 'medium') {
        where.avgPricePerPerson = { gte: 50, lte: 100 };
      } else if (params.price === 'high') {
        where.avgPricePerPerson = { gt: 100 };
      }
    }

    // Fetch chefs with includes
    const [chefs, totalCount] = await Promise.all([
      prisma.chefProfile.findMany({
        where,
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
        skip,
        take: pageSize,
        orderBy:
          params.sort === 'price-low'
            ? { avgPricePerPerson: 'asc' }
            : params.sort === 'price-high'
            ? { avgPricePerPerson: 'desc' }
            : params.sort === 'rating'
            ? { avgRating: 'desc' }
            : { id: 'desc' },
      }),
      prisma.chefProfile.count({ where }),
    ]);

    // Transform and filter by rating if needed
    let transformedChefs = chefs.map((chef) => {
      const avgRating =
        chef.reviews.length > 0
          ? chef.reviews.reduce((sum, r) => sum + r.rating, 0) / chef.reviews.length
          : 0;

      return {
        id: chef.id,
        name: chef.user.name || 'Chef',
        image: chef.user.image ?? undefined,
        bio: chef.bio ?? undefined,
        cuisines: chef.cuisines.map((c) => c.cuisine.name),
        avgPricePerPerson: chef.avgPricePerPerson ?? undefined,
        rating: avgRating,
        totalReviews: chef.reviews.length,
        verified: chef.verified,
      };
    });

    // Filter by rating (post-query since it's computed)
    if (params.rating) {
      const minRating = parseFloat(params.rating);
      transformedChefs = transformedChefs.filter((chef) => chef.rating >= minRating);
    }

    return {
      chefs: transformedChefs,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error('Error fetching chefs:', error);
    return {
      chefs: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}

export default async function ChefsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [cuisines, chefsData] = await Promise.all([
    getCuisines(),
    getChefs(params),
  ]);

  const { chefs, totalCount, totalPages, currentPage } = chefsData;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-4">Find your perfect chef</h1>
            <p className="text-xl text-gray-300 mb-8">
              Browse {totalCount}+ verified professional chefs ready to create unforgettable experiences
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-xl p-2 flex items-center gap-2">
              <div className="flex items-center gap-3 flex-1 px-4">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, cuisine, or location..."
                  className="flex-1 outline-none text-gray-900 text-lg"
                />
              </div>
              <Button
                size="lg"
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 rounded-xl"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <Suspense fallback={<div className="h-32 bg-gray-50" />}>
        <FilterBar cuisines={cuisines} />
      </Suspense>

      {/* Results Section */}
      <section className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {totalCount} {totalCount === 1 ? 'chef' : 'chefs'} found
              </h2>
              <p className="text-gray-600 mt-1">
                Showing {chefs.length === 0 ? 0 : (currentPage - 1) * 12 + 1}-
                {Math.min(currentPage * 12, totalCount)} of {totalCount}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select defaultValue={params.sort || 'relevance'}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Toggle */}
              <div className="hidden lg:flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
                <Button variant="ghost" size="sm" className="bg-gray-100">
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Chef Grid */}
          {chefs.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {chefs.map((chef) => (
                  <ChefCard key={chef.id} {...chef} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    className="rounded-lg"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'ghost'}
                          className="w-10 h-10 rounded-lg"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="px-2 text-gray-500">...</span>
                        <Button variant="ghost" className="w-10 h-10 rounded-lg">
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    className="rounded-lg"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl shadow-md p-12 max-w-lg mx-auto">
                <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No chefs found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search in a different area
                </p>
                <Button variant="outline" className="rounded-lg">
                  Clear all filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
