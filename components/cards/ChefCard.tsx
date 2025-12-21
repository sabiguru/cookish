'use client';

import Link from 'next/link';
import { Star, MapPin, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface ChefCardProps {
  id: string;
  name: string;
  image?: string;
  bio?: string;
  cuisines: string[];
  avgPricePerPerson?: number;
  rating?: number;
  totalReviews?: number;
  verified?: boolean;
}

export default function ChefCard({
  id,
  name,
  image,
  bio,
  cuisines,
  avgPricePerPerson,
  rating = 0,
  totalReviews = 0,
  verified = false,
}: ChefCardProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl">
      <CardContent className="p-0">
        <div className="relative">
          {/* Chef Image */}
          <div className="aspect-[4/3] overflow-hidden bg-gray-100">
            <Avatar className="w-full h-full rounded-none">
              <AvatarImage
                src={image}
                alt={name}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <AvatarFallback className="rounded-none text-4xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Verified Badge */}
          {verified && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-white text-gray-900 border-0 shadow-sm">
                ✓ Verified
              </Badge>
            </div>
          )}

          {/* Price Badge */}
          {avgPricePerPerson && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-white text-gray-900 border-0 shadow-sm flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {avgPricePerPerson}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-5">
          {/* Chef Name & Rating */}
          <div className="flex items-start justify-between mb-2">
            <Link href={`/chef/${id}`}>
              <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors">
                {name}
              </h3>
            </Link>
            {rating > 0 && (
              <div className="flex items-center gap-1 bg-gray-900 text-white px-2 py-1 rounded-lg text-sm">
                <Star className="h-3 w-3 fill-current" />
                <span className="font-medium">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Cuisines */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {cuisines.slice(0, 3).map((cuisine, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {cuisine}
              </Badge>
            ))}
            {cuisines.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                +{cuisines.length - 3}
              </Badge>
            )}
          </div>

          {/* Bio */}
          {bio && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{bio}</p>
          )}

          {/* Reviews Count */}
          {totalReviews > 0 && (
            <p className="text-xs text-gray-500 mb-4">
              {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          )}

          {/* CTA Button */}
          <Link href={`/chef/${id}`} className="block">
            <Button
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors"
              size="lg"
            >
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
