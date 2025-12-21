import { Star, Shield, Award, HeartHandshake } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Sarah Mitchell',
    role: 'Birthday Celebration',
    quote: 'Chef Marcus transformed our home into a Michelin-star restaurant. The experience was unforgettable!',
    rating: 5,
  },
  {
    name: 'James Chen',
    role: 'Corporate Event',
    quote: 'Professional service from start to finish. Our clients were thoroughly impressed with the quality.',
    rating: 5,
  },
  {
    name: 'Emma Thompson',
    role: 'Anniversary Dinner',
    quote: 'The perfect way to celebrate. Every dish was a work of art. Highly recommended!',
    rating: 5,
  },
];

const TRUST_BADGES = [
  {
    icon: Shield,
    label: 'Secure Payments',
    description: 'Protected transactions',
  },
  {
    icon: Award,
    label: 'DBS Checked',
    description: 'Verified chefs',
  },
  {
    icon: HeartHandshake,
    label: 'Allergy Aware',
    description: 'Dietary accommodations',
  },
];

export default function Testimonials() {
  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Trust Badges */}
        <div className="mb-16">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {TRUST_BADGES.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.label}
                  className="flex items-center gap-3 text-center"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-cream rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-ink text-sm">
                      {badge.label}
                    </div>
                    <div className="text-xs text-muted">
                      {badge.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonials Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-ink mb-2">
            Loved by Food Enthusiasts
          </h2>
          <p className="text-[15px] text-ink/80">
            Join thousands who have discovered exceptional dining at home
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl border border-border p-6 shadow-[0_8px_24px_rgba(0,0,0,.06)]"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[15px] text-ink leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                {/* Avatar placeholder */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cream to-gray-100 flex items-center justify-center text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-ink text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-muted">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
