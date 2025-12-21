import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  MapPin,
  Star,
  Award,
  ChefHat,
  Calendar,
  DollarSign,
  MessageCircle,
  Heart,
  Clock,
  Users,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import MenuCard from '@/components/cards/MenuCard';
import RatingBreakdown from '@/components/reviews/RatingBreakdown';
import ReviewList from '@/components/reviews/ReviewList';
import ChefActionButtons from '@/components/chef/ChefActionButtons';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const chef = await prisma.chefProfile.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  if (!chef) {
    return {
      title: 'Chef Not Found',
    };
  }

  return {
    title: `${chef.user.name || 'Chef'} — CookFort`,
    description: chef.bio || `Book ${chef.user.name} for your next event`,
  };
}

async function getChefProfile(id: string) {
  try {
    const chef = await prisma.chefProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            createdAt: true,
          },
        },
        cuisines: {
          include: {
            cuisine: true,
          },
        },
        dietTags: {
          include: {
            diet: true,
          },
        },
        certifications: {
          orderBy: {
            issuedAt: 'desc',
          },
        },
        menus: {
          where: {
            isActive: true,
          },
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
        },
        reviews: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
            booking: {
              select: {
                date: true,
              },
            },
          },
        },
        gallery: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 12,
        },
        availability: {
          where: {
            start: {
              gte: new Date(),
            },
          },
          orderBy: {
            start: 'asc',
          },
          take: 10,
        },
      },
    });

    if (!chef) {
      return null;
    }

    // Use denormalized rating from ChefProfile (updated on each review)
    const avgRating = chef.avgRating || 0;
    const reviewsCount = chef.reviewsCount || 0;

    // Calculate years of experience (based on account creation for now)
    const yearsExperience = Math.max(
      1,
      new Date().getFullYear() - new Date(chef.user.createdAt).getFullYear()
    );

    return {
      ...chef,
      avgRating,
      reviewsCount,
      yearsExperience,
    };
  } catch (error) {
    console.error('Error fetching chef profile:', error);
    return null;
  }
}

export default async function ChefProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const chef = await getChefProfile(params.id);

  if (!chef) {
    notFound();
  }

  const initials = (chef.user.name || 'Chef')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Chef Avatar */}
            <div className="relative">
              <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-white shadow-xl">
                <AvatarImage src={chef.user.image || undefined} alt={chef.user.name || 'Chef'} />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-purple-500">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {chef.verified && (
                <div className="absolute -bottom-2 -right-2">
                  <div className="bg-green-500 rounded-full p-2 shadow-lg">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Chef Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{chef.user.name || 'Chef'}</h1>
                  <div className="flex flex-wrap gap-3 text-gray-300">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>London, UK</span>
                    </div>
                    {chef.languages && chef.languages.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span>Speaks: {chef.languages.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-2xl font-bold">{chef.avgRating.toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-gray-300">{chef.reviewsCount} reviews</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="h-5 w-5 text-blue-400" />
                    <span className="text-2xl font-bold">{chef.yearsExperience}</span>
                  </div>
                  <p className="text-sm text-gray-300">years experience</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ChefHat className="h-5 w-5 text-orange-400" />
                    <span className="text-2xl font-bold">{chef.menus.length}</span>
                  </div>
                  <p className="text-sm text-gray-300">menus</p>
                </div>
                {chef.avgPricePerPerson && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-5 w-5 text-green-400" />
                      <span className="text-2xl font-bold">{chef.avgPricePerPerson}</span>
                    </div>
                    <p className="text-sm text-gray-300">avg per person</p>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <ChefActionButtons
                chefId={chef.id}
                chefName={chef.user.name || 'Chef'}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-8 h-12 bg-white rounded-2xl shadow-md">
            <TabsTrigger value="about" className="rounded-xl">
              About
            </TabsTrigger>
            <TabsTrigger value="menus" className="rounded-xl">
              Menus ({chef.menus.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-xl">
              Reviews ({chef.reviewsCount})
            </TabsTrigger>
            <TabsTrigger value="certifications" className="rounded-xl">
              Certifications
            </TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card className="border-0 shadow-md rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About Me</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {chef.bio || 'No bio available.'}
                </p>
              </CardContent>
            </Card>

            {/* Cuisines & Specialties */}
            <Card className="border-0 shadow-md rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cuisines & Specialties</h2>
                <div className="space-y-4">
                  {/* Cuisines */}
                  {chef.cuisines.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-2">Cuisines</h3>
                      <div className="flex flex-wrap gap-2">
                        {chef.cuisines.map((c) => (
                          c.description ? (
                            <Popover key={c.cuisineId}>
                              <PopoverTrigger asChild>
                                <button className="bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 rounded-full cursor-pointer transition-all hover:scale-105 font-medium">
                                  {c.cuisine.name} ℹ️
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-4">
                                <div className="space-y-2">
                                  <h4 className="font-bold text-lg text-gray-900">{c.cuisine.name}</h4>
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {c.description}
                                  </p>
                                </div>
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Badge
                              key={c.cuisineId}
                              className="bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700"
                            >
                              {c.cuisine.name}
                            </Badge>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specialties */}
                  {chef.specialties && chef.specialties.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-2">Specialty Dishes</h3>
                      <div className="flex flex-wrap gap-2">
                        {chef.specialties.map((specialty, idx) => (
                          <Badge
                            key={`specialty-${idx}`}
                            className="bg-orange-600 text-white px-4 py-2 text-sm hover:bg-orange-700"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dietary Tags */}
            {chef.dietTags.length > 0 && (
              <Card className="border-0 shadow-md rounded-2xl">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Dietary Options</h2>
                  <div className="flex flex-wrap gap-2">
                    {chef.dietTags.map((d) => (
                      <Badge
                        key={d.dietId}
                        className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 text-sm"
                      >
                        {d.diet.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Service Area & Travel */}
            <Card className="border-0 shadow-md rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Area</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Base Location</h3>
                      <p className="text-gray-600">London, UK</p>
                    </div>
                  </div>
                  {chef.travelRadiusKm && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Willing to Travel</h3>
                        <p className="text-gray-600">Up to {chef.travelRadiusKm} km from base location</p>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Coverage:</span> This chef serves the greater London area and surrounding regions.
                      {chef.travelRadiusKm && ` They are willing to travel up to ${chef.travelRadiusKm}km for your event.`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card className="border-0 shadow-md rounded-2xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Availability</h2>
                {chef.availability && chef.availability.length > 0 ? (
                  <div className="space-y-3">
                    {chef.availability.map((slot) => (
                      <div
                        key={slot.id}
                        className={`p-4 rounded-xl border-2 ${
                          slot.type === 'AVAILABLE'
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock className={`h-5 w-5 ${
                              slot.type === 'AVAILABLE' ? 'text-green-600' : 'text-red-600'
                            }`} />
                            <div>
                              <p className="font-semibold text-gray-900">
                                {new Date(slot.start).toLocaleDateString('en-GB', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(slot.start).toLocaleTimeString('en-GB', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })} - {new Date(slot.end).toLocaleTimeString('en-GB', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                          <Badge className={
                            slot.type === 'AVAILABLE'
                              ? 'bg-green-600 text-white'
                              : 'bg-red-600 text-white'
                          }>
                            {slot.type === 'AVAILABLE' ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                        {slot.note && (
                          <p className="mt-2 text-sm text-gray-600">{slot.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No availability information available yet.</p>
                    <p className="text-sm text-gray-500 mt-1">Contact the chef to check their schedule!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gallery */}
            {chef.gallery.length > 0 && (
              <Card className="border-0 shadow-md rounded-2xl">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {chef.gallery.map((media) => (
                      <div
                        key={media.id}
                        className="aspect-square rounded-xl overflow-hidden bg-gray-100"
                      >
                        <img
                          src={media.url}
                          alt={media.caption || 'Chef gallery'}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Menus Tab */}
          <TabsContent value="menus">
            {chef.menus.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chef.menus.map((menu) => {
                  // Collect unique dietary tags from menu items
                  const allDietaryTags = menu.items.flatMap((item) => item.dietaryTags);
                  const uniqueDietaryTags = Array.from(new Set(allDietaryTags));

                  return (
                    <MenuCard
                      key={menu.id}
                      id={menu.id}
                      title={menu.title}
                      description={menu.description || undefined}
                      pricePerPerson={menu.pricePerPerson}
                      minGuests={menu.minGuests}
                      maxGuests={menu.maxGuests || undefined}
                      dietaryTags={uniqueDietaryTags}
                    />
                  );
                })}
              </div>
            ) : (
              <Card className="border-0 shadow-md rounded-2xl">
                <CardContent className="p-12 text-center">
                  <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No menus yet</h3>
                  <p className="text-gray-600">This chef hasn&apos;t created any menus yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Rating breakdown sidebar */}
              <div className="lg:col-span-1">
                <RatingBreakdown chefId={chef.id} />
              </div>

              {/* Reviews list */}
              <div className="lg:col-span-2">
                {chef.reviews.length > 0 ? (
                  <ReviewList chefId={chef.id} />
                ) : (
                  <Card className="border-0 shadow-md rounded-2xl">
                    <CardContent className="p-12 text-center">
                      <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
                      <p className="text-gray-600">Be the first to book and review this chef!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications">
            {chef.certifications.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {chef.certifications.map((cert) => (
                  <Card key={cert.id} className="border-0 shadow-md rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-50 rounded-xl p-3">
                          <Award className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{cert.name}</h3>
                          {cert.issuer && (
                            <p className="text-sm text-gray-600 mb-2">Issued by {cert.issuer}</p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            {cert.issuedAt && (
                              <span>
                                Issued:{' '}
                                {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            )}
                            {cert.expiresAt && (
                              <span>
                                • Expires:{' '}
                                {new Date(cert.expiresAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-md rounded-2xl">
                <CardContent className="p-12 text-center">
                  <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No certifications yet
                  </h3>
                  <p className="text-gray-600">
                    This chef hasn&apos;t added any certifications.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
