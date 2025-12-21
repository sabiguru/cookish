'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Calendar, Clock, Users, Utensils } from 'lucide-react';
import Image from 'next/image';

const OCCASIONS = [
  'Birthday',
  'Anniversary',
  'Date Night',
  'Family Dinner',
  'Corporate Event',
  'Other',
];

const CUISINES = [
  'Italian',
  'French',
  'Japanese',
  'Chinese',
  'Indian',
  'Nigerian',
  'Mexican',
  'Mediterranean',
  'Vegan',
  'Vegetarian',
];

const TIME_SLOTS = [
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
];

export default function HeroBooking() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    date: '',
    time: '18:00',
    guests: '2',
    occasion: '',
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const params = new URLSearchParams();
    if (formData.location) params.set('location', formData.location);
    if (formData.date) params.set('date', formData.date);
    if (formData.time) params.set('time', formData.time);
    if (formData.guests) params.set('guests', formData.guests);
    if (formData.occasion) params.set('occasion', formData.occasion);

    router.push(`/search?${params.toString()}`);
  };

  const handleReserveLater = () => {
    router.push('/chefs');
  };

  return (
    <section className="relative bg-gradient-to-br from-cream to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-14 md:py-20">
        <div className="grid lg:grid-cols-[5fr_7fr] gap-8 items-center">
          {/* Left Column - Text + Form */}
          <div className="space-y-5">
            <div className="space-y-2.5">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-ink">
                Book a Private Chef in Minutes
              </h1>
              <p className="text-sm text-ink/80">
                Pick a date, tell us the vibe, we'll match a chef. From intimate dinners to grand celebrations.
              </p>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-5 border border-border shadow-[0_8px_24px_rgba(0,0,0,.06)] space-y-3.5">
              {/* Row 1: Location */}
              <div>
                <label htmlFor="location" className="sr-only">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="Location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="pl-10 h-12 border-border focus-visible:ring-accent"
                    aria-label="Location"
                  />
                </div>
              </div>

              {/* Row 2: Date and Time */}
              <div className="grid grid-cols-2 gap-3">
                {/* Date */}
                <div>
                  <label htmlFor="date" className="sr-only">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="pl-10 h-12 border-border focus-visible:ring-accent"
                      aria-label="Date"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label htmlFor="time" className="sr-only">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                    <select
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full h-12 pl-10 pr-4 rounded-md border border-border bg-background text-[15px] focus:outline-none focus:ring-2 focus:ring-accent appearance-none"
                      aria-label="Time"
                    >
                      {TIME_SLOTS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 3: Occasion and People */}
              <div className="grid grid-cols-2 gap-3">
                {/* Occasion/Cuisine */}
                <div>
                  <label htmlFor="occasion" className="sr-only">Occasion or Cuisine</label>
                  <div className="relative">
                    <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                    <select
                      id="occasion"
                      name="occasion"
                      value={formData.occasion}
                      onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                      className="w-full h-12 pl-10 pr-4 rounded-md border border-border bg-background text-[15px] focus:outline-none focus:ring-2 focus:ring-accent appearance-none"
                      aria-label="Occasion or Cuisine"
                    >
                      <option value="">Occasion</option>
                      <optgroup label="Occasions">
                        {OCCASIONS.map((occ) => (
                          <option key={occ} value={occ}>
                            {occ}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Cuisines">
                        {CUISINES.map((cui) => (
                          <option key={cui} value={cui}>
                            {cui}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label htmlFor="guests" className="sr-only">Number of Guests</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                    <Input
                      id="guests"
                      name="guests"
                      type="number"
                      min="2"
                      max="20"
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                      className="pl-10 h-12 border-border focus-visible:ring-accent"
                      aria-label="Number of Guests"
                      placeholder="Guests"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 bg-brand text-white hover:bg-brand/90 rounded-xl font-semibold"
                >
                  {isSubmitting ? 'Searching...' : 'Find Chefs'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleReserveLater}
                  className="flex-1 h-12 border border-border hover:bg-gray-50 rounded-xl font-semibold"
                >
                  Reserve for Later
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column - Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl">
              <Image
                src="/illustrations/hero-chef-arrival.png"
                alt="Chef arriving at customer's home with fresh ingredients"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
