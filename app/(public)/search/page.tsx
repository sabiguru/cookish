import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, ChefHat, Utensils, Globe } from 'lucide-react';
import ChefCard from '@/components/cards/ChefCard';
import MenuCard from '@/components/cards/MenuCard';
import CuisineCard from '@/components/cards/CuisineCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search — CookFort',
  description: 'Search for chefs, menus, and cuisines on CookFort',
};

interface SearchParams {
  q?: string;
  tab?: string;
}

async function searchAll(query: string) {
  try {
    if (!query || query.trim().length === 0) {
      return {
        chefs: [],
        menus: [],
        cuisines: [],
        totalResults: 0,
      };
    }

    const searchTerm = query.trim();

    // Search chefs
    const chefs = await prisma.chefProfile.findMany({
      where: {
        verified: true,
        OR: [
          {
            user: {
              name: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
          {
            bio: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            specialties: {
              hasSome: [searchTerm],
            },
          },
        ],
      },
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
      take: 12,
    });

    const transformedChefs = chefs.map((chef) => {
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

    // Search menus
    const menus = await prisma.menu.findMany({
      where: {
        isActive: true,
        OR: [
          {
            title: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
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
        items: {
          select: {
            dietaryTags: true,
          },
        },
      },
      take: 12,
    });

    const transformedMenus = menus.map((menu) => {
      const allDietaryTags = menu.items.flatMap((item) => item.dietaryTags);
      const uniqueDietaryTags = Array.from(new Set(allDietaryTags));

      return {
        id: menu.id,
        title: menu.title,
        description: menu.description || undefined,
        pricePerPerson: menu.pricePerPerson,
        minGuests: menu.minGuests,
        maxGuests: menu.maxGuests || undefined,
        dietaryTags: uniqueDietaryTags,
        chefName: menu.chef.user.name || undefined,
      };
    });

    // Search cuisines
    const cuisines = await prisma.cuisine.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
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
      take: 12,
    });

    const transformedCuisines = cuisines.map((cuisine) => ({
      id: cuisine.id,
      name: cuisine.name,
      slug: cuisine.slug,
      chefCount: cuisine.chefs.length,
    }));

    const totalResults =
      transformedChefs.length + transformedMenus.length + transformedCuisines.length;

    return {
      chefs: transformedChefs,
      menus: transformedMenus,
      cuisines: transformedCuisines,
      totalResults,
    };
  } catch (error) {
    console.error('Error searching:', error);
    return {
      chefs: [],
      menus: [],
      cuisines: [],
      totalResults: 0,
    };
  }
}

async function getPopularSearches() {
  try {
    // Get top cuisines as "popular searches"
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
      orderBy: {
        name: 'asc',
      },
      take: 8,
    });

    return cuisines
      .filter((c) => c.chefs.length > 0)
      .map((c) => c.name)
      .sort((a, b) => b.length - a.length)
      .slice(0, 6);
  } catch {
    return ['Italian', 'Japanese', 'Mexican', 'French', 'Thai', 'Indian'];
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';
  const activeTab = resolvedSearchParams.tab || 'all';

  const [results, popularSearches] = await Promise.all([
    searchAll(query),
    getPopularSearches(),
  ]);

  const { chefs, menus, cuisines, totalResults } = results;
  const hasQuery = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Search Bar */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="bg-gray-100 rounded-2xl p-2 flex items-center gap-2 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 flex-1 px-4">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for chefs, menus, or cuisines..."
                defaultValue={query}
                className="flex-1 outline-none bg-transparent text-gray-900 text-lg"
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
      </section>

      <div className="container mx-auto px-4 py-8">
        {hasQuery ? (
          <>
            {/* Results Summary */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Search results for &quot;{query}&quot;
              </h1>
              <p className="text-gray-600">
                Found {totalResults} {totalResults === 1 ? 'result' : 'results'}
              </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue={activeTab} className="w-full">
              <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-8 h-12 bg-white rounded-2xl shadow-md">
                <TabsTrigger value="all" className="rounded-xl">
                  All ({totalResults})
                </TabsTrigger>
                <TabsTrigger value="chefs" className="rounded-xl">
                  Chefs ({chefs.length})
                </TabsTrigger>
                <TabsTrigger value="menus" className="rounded-xl">
                  Menus ({menus.length})
                </TabsTrigger>
                <TabsTrigger value="cuisines" className="rounded-xl">
                  Cuisines ({cuisines.length})
                </TabsTrigger>
              </TabsList>

              {/* All Tab */}
              <TabsContent value="all" className="space-y-12">
                {totalResults === 0 ? (
                  <Card className="border-0 shadow-md rounded-2xl">
                    <CardContent className="p-12 text-center">
                      <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No results found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Try adjusting your search or browse popular categories below
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Chefs Results */}
                    {chefs.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                          <ChefHat className="h-6 w-6" />
                          Chefs ({chefs.length})
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {chefs.map((chef) => (
                            <ChefCard key={chef.id} {...chef} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Menus Results */}
                    {menus.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                          <Utensils className="h-6 w-6" />
                          Menus ({menus.length})
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {menus.map((menu) => (
                            <MenuCard key={menu.id} {...menu} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cuisines Results */}
                    {cuisines.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                          <Globe className="h-6 w-6" />
                          Cuisines ({cuisines.length})
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {cuisines.map((cuisine) => (
                            <CuisineCard key={cuisine.id} {...cuisine} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Chefs Tab */}
              <TabsContent value="chefs">
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
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No chefs found
                      </h3>
                      <p className="text-gray-600">
                        Try a different search term or browse all chefs
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Menus Tab */}
              <TabsContent value="menus">
                {menus.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menus.map((menu) => (
                      <MenuCard key={menu.id} {...menu} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-md rounded-2xl">
                    <CardContent className="p-12 text-center">
                      <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No menus found
                      </h3>
                      <p className="text-gray-600">
                        Try a different search term or browse all menus
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Cuisines Tab */}
              <TabsContent value="cuisines">
                {cuisines.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {cuisines.map((cuisine) => (
                      <CuisineCard key={cuisine.id} {...cuisine} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-md rounded-2xl">
                    <CardContent className="p-12 text-center">
                      <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No cuisines found
                      </h3>
                      <p className="text-gray-600">
                        Try a different search term or browse all cuisines
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          /* Empty State */
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-md rounded-2xl mb-12">
              <CardContent className="p-12 text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-gray-100 rounded-2xl p-6">
                    <Search className="h-16 w-16 text-gray-400" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  What are you looking for?
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Search for chefs, menus, or cuisines to find exactly what you need
                </p>
              </CardContent>
            </Card>

            {/* Popular Searches */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Popular searches</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {popularSearches.map((term, index) => (
                  <a
                    key={index}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="group"
                  >
                    <Badge
                      variant="secondary"
                      className="bg-white hover:bg-gray-900 hover:text-white border border-gray-200 px-4 py-2 text-sm cursor-pointer transition-colors"
                    >
                      {term}
                    </Badge>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <a href="/chefs">
                <Card className="border-0 shadow-md rounded-2xl hover:shadow-xl transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="bg-blue-50 rounded-2xl p-4">
                        <ChefHat className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      Browse Chefs
                    </h3>
                    <p className="text-sm text-gray-600">
                      Explore all verified professional chefs
                    </p>
                  </CardContent>
                </Card>
              </a>

              <a href="/cuisines">
                <Card className="border-0 shadow-md rounded-2xl hover:shadow-xl transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="bg-purple-50 rounded-2xl p-4">
                        <Globe className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      Browse Cuisines
                    </h3>
                    <p className="text-sm text-gray-600">
                      Discover cuisines from around the world
                    </p>
                  </CardContent>
                </Card>
              </a>

              <a href="/chefs">
                <Card className="border-0 shadow-md rounded-2xl hover:shadow-xl transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="bg-green-50 rounded-2xl p-4">
                        <Utensils className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      Browse Menus
                    </h3>
                    <p className="text-sm text-gray-600">View all available menu options</p>
                  </CardContent>
                </Card>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
