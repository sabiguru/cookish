'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Heart, ArrowRight, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Chef {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  cuisines: string[];
  avgPricePerPerson: number | null;
  rating: number;
  totalReviews: number;
  verified: boolean;
}

interface FeaturedChefsProps {
  chefs: Chef[];
}

export default function FeaturedChefs({ chefs }: FeaturedChefsProps) {
  if (chefs.length === 0) {
    return null;
  }

  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-semibold text-ink mb-2">
              Featured Chefs
            </h2>
            <p className="text-[15px] text-ink/80">
              Discover talented chefs ready to create unforgettable experiences
            </p>
          </div>
          <Link
            href="/chefs"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {chefs.map((chef) => (
            <Link
              key={chef.id}
              href={`/chef/${chef.id}`}
              className="group bg-card rounded-2xl border border-border overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,.06)] hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              {/* Chef Image */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                {chef.image ? (
                  <Image
                    src={chef.image}
                    alt={chef.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl text-muted/30">
                    👨‍🍳
                  </div>
                )}

                {/* Verified badge */}
                {chef.verified && (
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
                    <BadgeCheck className="w-4 h-4 text-accent" />
                    <span className="text-xs font-medium text-ink">Verified</span>
                  </div>
                )}

                {/* Favorite button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Implement favorite functionality
                  }}
                  className="absolute top-3 left-3 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                  aria-label="Save chef"
                >
                  <Heart className="w-4 h-4 text-muted" />
                </button>
              </div>

              {/* Chef Info */}
              <div className="p-5 space-y-3">
                {/* Name and Rating */}
                <div>
                  <h3 className="text-lg font-semibold text-ink mb-1 group-hover:text-accent transition-colors">
                    {chef.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-ink">
                      {chef.rating > 0 ? chef.rating.toFixed(1) : 'New'}
                    </span>
                    <span className="text-muted">
                      ({chef.totalReviews})
                    </span>
                  </div>
                </div>

                {/* Cuisines */}
                <div className="flex flex-wrap gap-1">
                  {chef.cuisines.slice(0, 3).map((cuisine) => (
                    <span
                      key={cuisine}
                      className="inline-block px-2 py-1 bg-cream text-xs font-medium text-ink rounded-md"
                    >
                      {cuisine}
                    </span>
                  ))}
                  {chef.cuisines.length > 3 && (
                    <span className="inline-block px-2 py-1 bg-cream text-xs font-medium text-muted rounded-md">
                      +{chef.cuisines.length - 3}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">From</span>
                    <span className="text-base font-semibold text-ink">
                      £{chef.avgPricePerPerson || 45}/guest
                    </span>
                  </div>
                </div>

                {/* Bio preview */}
                {chef.bio && (
                  <p className="text-sm text-muted line-clamp-2 leading-relaxed">
                    {chef.bio}
                  </p>
                )}

                {/* CTA */}
                <Button
                  variant="outline"
                  className="w-full border-border hover:bg-gray-50"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/chef/${chef.id}`;
                  }}
                >
                  View Profile
                </Button>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile "View all" button */}
        <div className="mt-8 text-center md:hidden">
          <Link href="/chefs">
            <Button variant="outline" className="w-full sm:w-auto">
              View all chefs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
