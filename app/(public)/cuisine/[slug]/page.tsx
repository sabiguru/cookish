import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChefHat,
  Star,
  Award,
  Globe,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import ChefCard from '@/components/cards/ChefCard';
import CuisineCard from '@/components/cards/CuisineCard';
import type { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const cuisine = await prisma.cuisine.findUnique({
    where: { slug: params.slug },
    select: { name: true },
  });

  if (!cuisine) {
    return {
      title: 'Cuisine Not Found',
    };
  }

  return {
    title: `${cuisine.name} Chefs — CookFort`,
    description: `Find expert ${cuisine.name} chefs for your next event. Book verified professional chefs specializing in ${cuisine.name} cuisine.`,
  };
}

async function getCuisineData(slug: string) {
  try {
    const cuisine = await prisma.cuisine.findUnique({
      where: { slug },
      include: {
        chefs: {
          where: {
            chef: {
              verified: true,
            },
          },
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
        },
      },
    });

    if (!cuisine) {
      return null;
    }

    // Transform chefs data
    const chefs = cuisine.chefs.map((cc) => {
      const chef = cc.chef;
      const avgRating =
        chef.reviews.length > 0
          ? chef.reviews.reduce((sum, r) => sum + r.rating, 0) / chef.reviews.length
          : 0;

      return {
        id: chef.id,
        name: chef.user.name || 'Chef',
        image: chef.user.image,
        bio: chef.bio,
        cuisines: chef.cuisines.map((c) => c.cuisine.name),
        avgPricePerPerson: chef.avgPricePerPerson,
        rating: avgRating,
        totalReviews: chef.reviews.length,
        verified: chef.verified,
      };
    });

    // Get related cuisines (other popular cuisines)
    const relatedCuisines = await prisma.cuisine.findMany({
      where: {
        id: { not: cuisine.id },
      },
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
      take: 6,
      orderBy: {
        name: 'asc',
      },
    });

    const relatedWithCounts = relatedCuisines.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      chefCount: c.chefs.length,
    }));

    return {
      cuisine: {
        id: cuisine.id,
        name: cuisine.name,
        slug: cuisine.slug,
      },
      chefs,
      relatedCuisines: relatedWithCounts,
    };
  } catch (error) {
    console.error('Error fetching cuisine data:', error);
    return null;
  }
}

export default async function CuisineDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getCuisineData(params.slug);

  if (!data) {
    notFound();
  }

  const { cuisine, chefs, relatedCuisines } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        {/* Background Pattern/Image Overlay */}
        <div className="absolute inset-0 bg-[url('/patterns/food-pattern.png')] opacity-5" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <ChefHat className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">{cuisine.name} Cuisine</h1>
            <p className="text-xl text-gray-300 mb-8">
              Discover {chefs.length} expert {chefs.length === 1 ? 'chef' : 'chefs'}{' '}
              specializing in authentic {cuisine.name} cuisine
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3">
                <div className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  <span className="font-semibold">{chefs.length} Chefs</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">100% Verified</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-semibold">Top Rated</span>
                </div>
              </div>
            </div>

            <Link href="/chefs">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 rounded-xl px-8"
              >
                Browse All Cuisines
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Chefs Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Featured {cuisine.name} Chefs
          </h2>
          <p className="text-gray-600">
            Browse our verified professional chefs specializing in {cuisine.name} cuisine
          </p>
        </div>

        {chefs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {chefs.map((chef) => (
              <ChefCard key={chef.id} {...chef} />
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="p-12 text-center">
              <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No chefs yet</h3>
              <p className="text-gray-600 mb-6">
                We don&apos;t have any {cuisine.name} chefs at the moment. Check back soon!
              </p>
              <Link href="/chefs">
                <Button variant="outline" className="rounded-xl">
                  Browse all chefs
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Why Choose Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose {cuisine.name} Cuisine?
              </h2>
              <p className="text-lg text-gray-600">
                Experience authentic flavors from expert chefs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-md rounded-2xl">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-50 rounded-2xl p-4">
                      <Award className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    Expert Chefs
                  </h3>
                  <p className="text-gray-600">
                    All our {cuisine.name} chefs are verified professionals with years of
                    experience
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-2xl">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-purple-50 rounded-2xl p-4">
                      <Globe className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    Authentic Recipes
                  </h3>
                  <p className="text-gray-600">
                    Traditional {cuisine.name} recipes passed down through generations
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-2xl">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-green-50 rounded-2xl p-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    Quality Guaranteed
                  </h3>
                  <p className="text-gray-600">
                    Premium ingredients and exceptional service for every event
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Related Cuisines */}
      {relatedCuisines.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Explore More Cuisines</h2>
              <p className="text-gray-600">
                Discover other culinary styles from around the world
              </p>
            </div>
            <Link href="/cuisines">
              <Button variant="outline" className="rounded-xl gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCuisines.map((related) => (
              <CuisineCard
                key={related.id}
                name={related.name}
                slug={related.slug}
                chefCount={related.chefCount}
              />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to book a {cuisine.name} chef?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Browse our verified {cuisine.name} chefs and find the perfect match for your
            event
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={`/chefs?cuisine=${cuisine.slug}`}>
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 rounded-xl px-8"
              >
                Find a Chef
              </Button>
            </Link>
            <Link href="/cuisines">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 rounded-xl px-8"
              >
                Browse Cuisines
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
