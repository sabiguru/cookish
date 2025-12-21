'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Slide {
  title: string;
  description: string;
  image: string;
}

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const slides: Slide[] = [
    {
      title: 'The Future of Personal Dining',
      description: 'Experience restaurant-quality dining in your home with AI-matched professional chefs.',
      image: 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg',
    },
    {
      title: 'Discover Culinary Excellence',
      description: 'Connect with top chefs specializing in cuisines from around the world',
      image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setAutoplay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setAutoplay(false);
  };

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay, slides.length]);

  const handleFindChef = () => {
    router.push('/chefs');
  };

  const handleLearnMore = () => {
    router.push('/how-it-works');
  };

  return (
    <section className="mt-6 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-xl bg-gray-50">
          {/* Carousel Container */}
          <div
            ref={carouselRef}
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={index} className="w-full flex-shrink-0 flex flex-col md:flex-row">
                {/* Left Side - Text Content */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center bg-gray-50">
                  <div className="max-w-xl">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
                      {slide.title}
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                      {slide.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button size="lg" className="text-lg" onClick={handleFindChef}>
                        Find Your Chef
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="text-lg"
                        onClick={handleLearnMore}
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Side - Image */}
                <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${slide.image})` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-md z-20"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-md z-20"
            onClick={nextSlide}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
