'use client';

import Link from 'next/link';
import { Users, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MenuCardProps {
  id: string;
  title: string;
  description?: string;
  pricePerPerson: number;
  minGuests: number;
  maxGuests?: number;
  dietaryTags?: string[];
  chefName?: string;
  image?: string;
}

export default function MenuCard({
  id,
  title,
  description,
  pricePerPerson,
  minGuests,
  maxGuests,
  dietaryTags = [],
  chefName,
  image,
}: MenuCardProps) {
  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl">
      <CardContent className="p-0">
        {/* Menu Image */}
        {image && (
          <div className="aspect-video overflow-hidden bg-gradient-to-br from-orange-100 to-pink-100">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-5">
          {/* Chef Name */}
          {chefName && (
            <p className="text-xs text-gray-500 mb-2">by {chefName}</p>
          )}

          {/* Menu Title */}
          <Link href={`/menu/${id}`}>
            <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors mb-2 line-clamp-1">
              {title}
            </h3>
          </Link>

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {description}
            </p>
          )}

          {/* Dietary Tags */}
          {dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {dietaryTags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-green-50 text-green-700 border-green-200"
                >
                  {tag}
                </Badge>
              ))}
              {dietaryTags.length > 3 && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-gray-100 text-gray-700"
                >
                  +{dietaryTags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Price & Guests */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 text-gray-900">
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold">{pricePerPerson}</span>
              <span className="text-sm text-gray-500">/person</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600 text-sm">
              <Users className="h-4 w-4" />
              <span>
                {minGuests}
                {maxGuests && `- ${maxGuests}`} guests
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <Link href={`/menu/${id}`} className="block">
            <Button
              variant="outline"
              className="w-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-xl transition-colors"
              size="lg"
            >
              View Menu
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
