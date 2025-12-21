'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ChefHat } from 'lucide-react';

interface CuisineCardProps {
  name: string;
  slug: string;
  image?: string;
  chefCount?: number;
}

export default function CuisineCard({
  name,
  slug,
  image,
  chefCount,
}: CuisineCardProps) {
  return (
    <Link href={`/cuisine/${slug}`}>
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl cursor-pointer">
        <CardContent className="p-0 relative">
          {/* Background Image */}
          <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100">
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ChefHat className="h-16 w-16 text-gray-400" />
              </div>
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <h3 className="font-bold text-2xl mb-1 group-hover:scale-105 transition-transform">
              {name}
            </h3>
            {chefCount !== undefined && (
              <p className="text-sm text-white/90">
                {chefCount} {chefCount === 1 ? 'chef' : 'chefs'} available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
