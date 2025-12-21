import Link from 'next/link';
import { ChefHat, Calendar, CalendarCheck, Sparkles, Building2, UtensilsCrossed, ArrowRight } from 'lucide-react';

const SUGGESTION_TILES = [
  {
    title: 'Book a Chef',
    description: 'Find and book professional chefs for your next meal or event',
    href: '/chefs?type=booking',
    icon: ChefHat,
  },
  {
    title: 'Reserve',
    description: 'Schedule a chef for a future date and customize your menu',
    href: '/chefs?type=reservation',
    icon: Calendar,
  },
  {
    title: 'Weekly Meal Plan',
    description: 'Get chef-prepared meals delivered throughout the week',
    href: '/search?type=meal-plan',
    icon: CalendarCheck,
  },
  {
    title: 'Event Catering',
    description: 'Professional catering for weddings, parties, and celebrations',
    href: '/search?type=event-catering',
    icon: Sparkles,
  },
  {
    title: 'Gourmet Experiences',
    description: 'Exclusive fine dining experiences in your home',
    href: '/search?type=gourmet',
    icon: UtensilsCrossed,
  },
  {
    title: 'Corporate Dining',
    description: 'Impress clients and teams with executive chef services',
    href: '/search?type=corporate',
    icon: Building2,
  },
];

export default function Suggestions() {
  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl font-semibold text-ink mb-2">
            Suggestions
          </h2>
          <p className="text-[15px] text-ink/80">
            Explore our curated services to find the perfect dining solution
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUGGESTION_TILES.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.title}
                href={tile.href}
                className="group relative rounded-2xl border border-border bg-card p-5 shadow-[0_8px_24px_rgba(0,0,0,.06)] hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  {/* Icon placeholder */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cream to-gray-100 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-brand" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-ink mb-1 group-hover:text-accent transition-colors">
                      {tile.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed mb-3">
                      {tile.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
                      Details
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>

                {/* Illustration placeholder */}
                <div className="mt-4 h-32 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-muted/30" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
