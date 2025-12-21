import { prisma } from '@/lib/prisma';
import HeroBooking from '@/components/home/HeroBooking';
import Suggestions from '@/components/home/Suggestions';
import HowItWorks from '@/components/home/HowItWorks';
import FeaturedChefs from '@/components/home/FeaturedChefs';
import CuisineGrid from '@/components/home/CuisineGrid';
import ForChefsCard from '@/components/home/ForChefsCard';
import Testimonials from '@/components/home/Testimonials';
import FooterCTA from '@/components/home/FooterCTA';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CookFort — Book a Private Chef in Minutes',
  description: 'Find and book professional chefs for any occasion. From intimate dinners to grand celebrations, experience restaurant-quality dining at home.',
};

async function getTopChefs() {
  try {
    const chefs = await prisma.chefProfile.findMany({
      where: {
        verified: true,
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
      take: 4,
      orderBy: {
        verified: 'desc',
      },
    });

    return chefs.map((chef) => {
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
  } catch {
    return [];
  }
}

async function getPopularCuisines() {
  try {
    const cuisines = await prisma.cuisine.findMany({
      take: 12,
      orderBy: {
        name: 'asc',
      },
    });
    return cuisines;
  } catch {
    return [];
  }
}

export default async function Home() {
  const [topChefs, cuisines] = await Promise.all([
    getTopChefs(),
    getPopularCuisines(),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero Section - Booking First (Uber-style) */}
      <HeroBooking />

      {/* Suggestions Tiles */}
      <Suggestions />

      {/* How It Works - 4 Steps */}
      <HowItWorks />

      {/* Featured Chefs */}
      <FeaturedChefs chefs={topChefs} />

      {/* Explore Cuisines */}
      <CuisineGrid cuisines={cuisines} />

      {/* For Chefs Card */}
      <ForChefsCard />

      {/* Trust & Social Proof / Testimonials */}
      <Testimonials />

      {/* Footer CTA */}
      <FooterCTA />
    </div>
  );
}
