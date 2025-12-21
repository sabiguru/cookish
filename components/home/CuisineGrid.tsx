'use client';

import Link from 'next/link';
import { ArrowRight, ChefHat } from 'lucide-react';
import { useRef } from 'react';

interface Cuisine {
  id: string;
  name: string;
  slug: string;
}

interface CuisineGridProps {
  cuisines: Cuisine[];
}

export default function CuisineGrid({ cuisines }: CuisineGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (cuisines.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-14 md:py-20 bg-gradient-to-b from-cream/30 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-semibold text-ink mb-2">
              Explore Cuisines
            </h2>
            <p className="text-[15px] text-ink/80">
              Discover diverse culinary styles from around the world
            </p>
          </div>
          <Link
            href="/cuisines"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Scrollable Category Pills */}
        <div className="relative mb-8">
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {cuisines.map((cuisine) => (
              <Link
                key={cuisine.id}
                href={`/cuisine/${cuisine.slug}`}
                className="flex-shrink-0 snap-start px-5 py-2.5 bg-card border border-border rounded-full text-sm font-medium text-ink hover:bg-accent hover:text-white hover:border-accent transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {cuisine.name}
              </Link>
            ))}
          </div>

          {/* Scroll buttons */}
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-white border border-border rounded-full items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
            aria-label="Scroll left"
          >
            ‹
          </button>
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-white border border-border rounded-full items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>

        {/* Cuisine Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cuisines.slice(0, 8).map((cuisine) => (
            <Link
              key={cuisine.id}
              href={`/cuisine/${cuisine.slug}`}
              className="group bg-card rounded-2xl border border-border p-6 shadow-[0_8px_24px_rgba(0,0,0,.06)] hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              {/* Cuisine illustration placeholder */}
              <div className="aspect-square mb-4 rounded-xl bg-gradient-to-br from-cream to-gray-100 flex items-center justify-center">
                <span className="text-4xl">🍽️</span>
              </div>

              {/* Cuisine name */}
              <h3 className="text-base font-semibold text-ink mb-1 group-hover:text-accent transition-colors">
                {cuisine.name}
              </h3>

              {/* Chef count placeholder */}
              <div className="flex items-center gap-1 text-xs text-muted">
                <ChefHat className="w-3 h-3" />
                <span>Available chefs</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile "View all" button */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/cuisines"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            View all cuisines
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
