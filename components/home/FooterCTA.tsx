import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FooterCTA() {
  return (
    <section className="py-14 md:py-20 bg-gradient-to-br from-accent/5 via-cream to-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Ready to elevate your dining?
        </div>

        <h2 className="text-4xl lg:text-5xl font-semibold mb-6 text-ink">
          Get Your Dinner Right with{' '}
          <span className="text-accent">CookFort Reserve</span>
        </h2>

        <p className="text-[15px] text-ink/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          From intimate dinners to grand celebrations, our verified chefs bring restaurant-quality experiences to your home. Book now or plan for later.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/chefs">
            <Button
              size="lg"
              className="bg-brand text-white hover:bg-brand/90 px-10 py-6 rounded-xl text-base font-semibold shadow-xl"
            >
              Find Your Chef
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <Link href="/chefs">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-border hover:bg-gray-50 px-10 py-6 rounded-xl text-base font-semibold"
            >
              Plan for Later
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted mt-6">
          No upfront fees • Secure payments • Cancel anytime
        </p>
      </div>
    </section>
  );
}
