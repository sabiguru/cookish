import Link from 'next/link';
import { Search, Calendar, CreditCard, Utensils, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    title: 'Browse & Select',
    description: 'Compare chefs, menus, and reviews.',
  },
  {
    icon: Calendar,
    title: 'Book & Customize',
    description: 'Set date, guests, and dietary needs.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Held safely, released after service.',
  },
  {
    icon: Utensils,
    title: 'Enjoy Your Experience',
    description: 'Chef shops, cooks, serves, cleans.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-14 md:py-20 bg-gradient-to-b from-white to-cream/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-ink mb-2">
            How It Works
          </h2>
          <p className="text-[15px] text-ink/80 max-w-2xl mx-auto">
            From finding your perfect chef to enjoying a restaurant-quality meal at home
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative bg-card rounded-2xl p-6 border border-border shadow-[0_8px_24px_rgba(0,0,0,.06)] hover:shadow-md transition-shadow"
              >
                {/* Step number badge */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                  {index + 1}
                </div>

                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cream to-gray-100 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-brand" strokeWidth={1.5} />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-ink">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[15px] text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connection line to next step (hidden on last item and mobile) */}
                {index < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border" />
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            Learn more
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
