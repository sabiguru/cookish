import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ChefHat, Globe, TrendingUp } from 'lucide-react';
import CuisineCard from '@/components/cards/CuisineCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Cuisines — CookFort',
  description:
    'Explore cuisines from around the world. Find professional chefs specializing in your favorite culinary styles.',
};

async function getCuisinesWithChefCounts() {
  try {
    const cuisines = await prisma.cuisine.findMany({
      orderBy: { name: 'asc' },
      include: {
        chefs: {
          where: {
            chef: {
              verified: true,
            },
          },
          select: {
            chefId: true,
          },
        },
      },
    });

    // Transform to include chef counts
    const cuisinesWithCounts = cuisines.map((cuisine) => ({
      id: cuisine.id,
      name: cuisine.name,
      slug: cuisine.slug,
      chefCount: cuisine.chefs.length,
    }));

    // Calculate total stats
    const totalCuisines = cuisines.length;
    const totalChefs = await prisma.chefProfile.count({
      where: { verified: true },
    });

    return {
      cuisines: cuisinesWithCounts,
      totalCuisines,
      totalChefs,
    };
  } catch (error) {
    console.error('Error fetching cuisines:', error);
    return {
      cuisines: [],
      totalCuisines: 0,
      totalChefs: 0,
    };
  }
}

async function getFeaturedCuisines() {
  try {
    // Get cuisines - mix of all cuisines fairly
    const cuisines = await prisma.cuisine.findMany({
      include: {
        chefs: {
          where: {
            chef: {
              verified: true,
            },
          },
          select: {
            chefId: true,
          },
        },
      },
    });

    // Map cuisines with chef counts
    const cuisinesWithCounts = cuisines.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      chefCount: c.chefs.length,
    }));

    // Shuffle array to show random/fair selection instead of biased sorting
    const shuffled = [...cuisinesWithCounts].sort(() => Math.random() - 0.5);

    // Take first 6 from shuffled array
    return shuffled.slice(0, 6);
  } catch {
    return [];
  }
}

export default async function CuisinesPage() {
  const [data, featuredCuisines] = await Promise.all([
    getCuisinesWithChefCounts(),
    getFeaturedCuisines(),
  ]);

  const { cuisines, totalCuisines, totalChefs } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <Globe className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4">Explore World Cuisines</h1>
            <p className="text-xl text-gray-300 mb-8">
              From Italian to Japanese, discover authentic flavors prepared by expert chefs
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-xl p-2 flex items-center gap-2">
              <div className="flex items-center gap-3 flex-1 px-4">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cuisines..."
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

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-0 shadow-md rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-2">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{totalCuisines}</p>
                <p className="text-sm text-gray-600">Cuisines</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-2">
                  <div className="bg-purple-50 rounded-xl p-3">
                    <ChefHat className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{totalChefs}+</p>
                <p className="text-sm text-gray-600">Expert Chefs</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md rounded-2xl col-span-2 md:col-span-1">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-2">
                  <div className="bg-green-50 rounded-xl p-3">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">100%</p>
                <p className="text-sm text-gray-600">Verified</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Cuisines */}
      {featuredCuisines.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Cuisines</h2>
                <p className="text-gray-600">Explore diverse culinary traditions from around the world</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {featuredCuisines.map((cuisine) => (
                <CuisineCard
                  key={cuisine.id}
                  name={cuisine.name}
                  slug={cuisine.slug}
                  chefCount={cuisine.chefCount}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Cuisines Grid */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">All Cuisines</h2>
            <p className="text-gray-600">
              Browse all {totalCuisines} cuisines available on CookFort
            </p>
          </div>

          {cuisines.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {cuisines.map((cuisine) => (
                <CuisineCard
                  key={cuisine.id}
                  name={cuisine.name}
                  slug={cuisine.slug}
                  chefCount={cuisine.chefCount}
                />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-md rounded-2xl">
              <CardContent className="p-12 text-center">
                <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No cuisines available
                </h3>
                <p className="text-gray-600">
                  Check back soon for new cuisines and chefs!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Can&apos;t find your favorite cuisine?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            We&apos;re always adding new chefs and cuisines. Let us know what you&apos;re
            looking for!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 rounded-xl px-8"
            >
              Request a Cuisine
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 rounded-xl px-8"
            >
              Become a Chef
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
