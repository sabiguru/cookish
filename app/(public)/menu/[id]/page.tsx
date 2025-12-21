import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Users,
  DollarSign,
  Clock,
  ChefHat,
  Star,
  Calendar,
  MapPin,
  Utensils,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import MenuCard from '@/components/cards/MenuCard';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const menu = await prisma.menu.findUnique({
    where: { id: params.id },
    select: {
      title: true,
      description: true,
    },
  });

  if (!menu) {
    return {
      title: 'Menu Not Found',
    };
  }

  return {
    title: `${menu.title} — CookFort`,
    description: menu.description || `Book this menu for your next event`,
  };
}

async function getMenuDetails(id: string) {
  try {
    const menu = await prisma.menu.findUnique({
      where: { id },
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
        items: {
          include: {
            recipe: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    if (!menu) {
      return null;
    }

    // Calculate chef's average rating
    const avgRating =
      menu.chef.reviews.length > 0
        ? menu.chef.reviews.reduce((sum, r) => sum + r.rating, 0) /
          menu.chef.reviews.length
        : 0;

    // Get related menus from same chef
    const relatedMenus = await prisma.menu.findMany({
      where: {
        chefId: menu.chefId,
        id: { not: id },
        isActive: true,
      },
      take: 3,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: {
          select: {
            dietaryTags: true,
          },
        },
      },
    });

    return {
      ...menu,
      chef: {
        ...menu.chef,
        avgRating,
      },
      relatedMenus,
    };
  } catch (error) {
    console.error('Error fetching menu details:', error);
    return null;
  }
}

export default async function MenuDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const menuData = await getMenuDetails(params.id);

  if (!menuData) {
    notFound();
  }

  const { chef, relatedMenus, ...menu } = menuData;

  // Group menu items by category (using first word or "Main Course" as default)
  const groupedItems = menu.items.reduce((acc, item) => {
    const category = item.name.includes('Appetizer')
      ? 'Appetizers'
      : item.name.includes('Dessert')
      ? 'Desserts'
      : item.name.includes('Side')
      ? 'Sides'
      : 'Main Course';

    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof menu.items>);

  // Collect unique dietary tags
  const allDietaryTags = menu.items.flatMap((item) => item.dietaryTags);
  const uniqueDietaryTags = Array.from(new Set(allDietaryTags));

  // Parse add-ons from JSON
  const addOns = menu.addOns as any[];

  const chefInitials = (chef.user.name || 'Chef')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/chefs">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to chefs
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Menu Image */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 shadow-lg">
              <div className="w-full h-full flex items-center justify-center">
                <Utensils className="h-32 w-32 text-gray-400" />
              </div>
            </div>

            {/* Menu Info */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{menu.title}</h1>
                {menu.description && (
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {menu.description}
                  </p>
                )}

                {/* Dietary Tags */}
                {uniqueDietaryTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {uniqueDietaryTags.map((tag, index) => (
                      <Badge
                        key={index}
                        className="bg-green-50 text-green-700 border border-green-200 px-3 py-1"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Key Info Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Card className="border-0 shadow-md rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 rounded-lg p-2">
                          <DollarSign className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            ${menu.pricePerPerson}
                          </p>
                          <p className="text-sm text-gray-600">per person</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-50 rounded-lg p-2">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {menu.minGuests}
                            {menu.maxGuests && `-${menu.maxGuests}`}
                          </p>
                          <p className="text-sm text-gray-600">guests</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Book This Menu
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-900 text-gray-900 hover:bg-gray-50 rounded-xl"
                >
                  <ChefHat className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2 space-y-8">
            {/* Menu Items by Category */}
            {Object.entries(groupedItems).map(([category, items]) => (
              <Card key={category} className="border-0 shadow-md rounded-2xl">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Utensils className="h-6 w-6" />
                    {category}
                  </h2>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                          {item.isRequired && (
                            <Badge className="bg-gray-900 text-white text-xs">Required</Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-gray-600 mb-2">{item.description}</p>
                        )}
                        {item.dietaryTags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {item.dietaryTags.map((tag, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs bg-green-50 text-green-700"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add-ons */}
            {addOns && addOns.length > 0 && (
              <Card className="border-0 shadow-md rounded-2xl">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Plus className="h-6 w-6" />
                    Optional Add-ons
                  </h2>
                  <div className="space-y-3">
                    {addOns.map((addon: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-900">{addon.name}</h3>
                          {addon.description && (
                            <p className="text-sm text-gray-600">{addon.description}</p>
                          )}
                        </div>
                        <p className="font-bold text-gray-900">+${addon.price}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Chef Info Card */}
            <Card className="border-0 shadow-md rounded-2xl sticky top-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Your Chef</h3>
                <Link
                  href={`/chef/${chef.id}`}
                  className="flex items-start gap-4 group mb-4"
                >
                  <div className="relative">
                    <Avatar className="w-16 h-16">
                      <AvatarImage
                        src={chef.user.image || undefined}
                        alt={chef.user.name || 'Chef'}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {chefInitials}
                      </AvatarFallback>
                    </Avatar>
                    {chef.verified && (
                      <div className="absolute -bottom-1 -right-1">
                        <div className="bg-green-500 rounded-full p-1">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {chef.user.name || 'Chef'}
                    </h4>
                    {chef.avgRating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium text-gray-900">
                          {chef.avgRating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({chef.reviews.length} reviews)
                        </span>
                      </div>
                    )}
                    {chef.cuisines.length > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        {chef.cuisines.map((c) => c.cuisine.name).join(', ')}
                      </p>
                    )}
                  </div>
                </Link>
                <Link href={`/chef/${chef.id}`}>
                  <Button variant="outline" className="w-full rounded-xl border-2">
                    View Chef Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card className="border-0 shadow-md rounded-2xl">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Price Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Per person</span>
                    <span className="font-medium">${menu.pricePerPerson}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Minimum guests</span>
                    <span className="font-medium">{menu.minGuests}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between text-gray-900">
                      <span className="font-semibold">Starting from</span>
                      <span className="text-xl font-bold">
                        ${menu.pricePerPerson * menu.minGuests}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Features */}
            <Card className="border-0 shadow-md rounded-2xl">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">What&apos;s Included</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Professional chef service</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">All ingredients & supplies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Meal preparation & plating</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Kitchen cleanup</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Menus */}
        {relatedMenus.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                More from {chef.user.name}
              </h2>
              <Link href={`/chef/${chef.id}?tab=menus`}>
                <Button variant="outline" className="rounded-xl">
                  View all menus
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedMenus.map((relatedMenu) => {
                const relatedDietaryTags = relatedMenu.items.flatMap(
                  (item) => item.dietaryTags
                );
                const uniqueRelatedTags = Array.from(new Set(relatedDietaryTags));

                return (
                  <MenuCard
                    key={relatedMenu.id}
                    id={relatedMenu.id}
                    title={relatedMenu.title}
                    description={relatedMenu.description || undefined}
                    pricePerPerson={relatedMenu.pricePerPerson}
                    minGuests={relatedMenu.minGuests}
                    maxGuests={relatedMenu.maxGuests || undefined}
                    dietaryTags={uniqueRelatedTags}
                    chefName={chef.user.name || undefined}
                  />
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
