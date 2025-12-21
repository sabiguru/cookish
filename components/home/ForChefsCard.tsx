import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChefHat, TrendingUp, Calendar, DollarSign } from 'lucide-react';

export default function ForChefsCard() {
  return (
    <section className="py-14 md:py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-card rounded-2xl border border-border shadow-[0_8px_24px_rgba(0,0,0,.06)] overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left - Content */}
            <div className="p-8 md:p-12 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium">
                <ChefHat className="w-4 h-4" />
                For Chefs
              </div>

              <h2 className="text-3xl md:text-4xl font-semibold text-ink">
                Cook When You Want,
                <br />
                Earn What You Need
              </h2>

              <p className="text-[15px] text-ink/80 leading-relaxed">
                Join our platform and connect with customers looking for exceptional culinary experiences.
                Set your own schedule, showcase your skills, and grow your business.
              </p>

              {/* Benefits */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-cream rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink text-sm mb-1">Flexible Schedule</h4>
                    <p className="text-xs text-muted">Work when it suits you</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-cream rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink text-sm mb-1">Competitive Earnings</h4>
                    <p className="text-xs text-muted">Set your own rates</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-cream rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink text-sm mb-1">Grow Your Brand</h4>
                    <p className="text-xs text-muted">Build your reputation</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-cream rounded-lg flex items-center justify-center">
                    <ChefHat className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink text-sm mb-1">Support & Tools</h4>
                    <p className="text-xs text-muted">Everything you need</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/auth/chef-signup">
                  <Button
                    size="lg"
                    className="bg-brand text-white hover:bg-brand/90 rounded-xl font-semibold px-8"
                  >
                    Become a Chef
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right - Illustration placeholder */}
            <div className="relative hidden lg:block h-full min-h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-cream flex items-center justify-center p-12">
                <div className="text-center space-y-4">
                  <ChefHat className="h-20 w-20 text-accent/40 mx-auto" />
                  <p className="text-sm text-muted">Illustration Placeholder</p>
                  <p className="text-xs text-muted/60">Cook when you want (4:3)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
