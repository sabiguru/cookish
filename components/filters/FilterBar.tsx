'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { X, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  cuisines?: { id: string; name: string; slug: string }[];
  occasions?: { id: string; name: string }[];
}

export default function FilterBar({ cuisines = [], occasions = [] }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);

  // Current filter values from URL
  const currentCuisine = searchParams.get('cuisine') || '';
  const currentPrice = searchParams.get('price') || '';
  const currentRating = searchParams.get('rating') || '';
  const currentOccasion = searchParams.get('occasion') || '';
  const currentDistance = searchParams.get('distance') || '';

  const [priceRange, setPriceRange] = useState<number[]>([
    currentPrice === 'low' ? 0 : currentPrice === 'medium' ? 50 : currentPrice === 'high' ? 100 : 0,
  ]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/chefs?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/chefs');
  };

  const hasActiveFilters =
    currentCuisine || currentPrice || currentRating || currentOccasion || currentDistance;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        {/* Mobile Toggle */}
        <div className="flex items-center justify-between lg:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="default" className="ml-2">
                Active
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          )}
        </div>

        {/* Filter Options */}
        <div
          className={`${
            isExpanded ? 'block' : 'hidden'
          } lg:block space-y-4 lg:space-y-0`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Cuisine Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Cuisine
              </label>
              <Select value={currentCuisine} onValueChange={(val) => updateFilter('cuisine', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="All cuisines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cuisines</SelectItem>
                  {cuisines.map((cuisine) => (
                    <SelectItem key={cuisine.id} value={cuisine.slug}>
                      {cuisine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Price Range
              </label>
              <Select value={currentPrice} onValueChange={(val) => updateFilter('price', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any price</SelectItem>
                  <SelectItem value="low">£ - Under £50/person</SelectItem>
                  <SelectItem value="medium">££ - £50-100/person</SelectItem>
                  <SelectItem value="high">£££ - Over £100/person</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Rating
              </label>
              <Select value={currentRating} onValueChange={(val) => updateFilter('rating', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any rating</SelectItem>
                  <SelectItem value="4.5">4.5+ stars</SelectItem>
                  <SelectItem value="4.0">4.0+ stars</SelectItem>
                  <SelectItem value="3.5">3.5+ stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Occasion Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Occasion
              </label>
              <Select value={currentOccasion} onValueChange={(val) => updateFilter('occasion', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any occasion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any occasion</SelectItem>
                  {occasions.length > 0 ? (
                    occasions.map((occasion) => (
                      <SelectItem key={occasion.id} value={occasion.id}>
                        {occasion.name}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="corporate">Corporate Event</SelectItem>
                      <SelectItem value="intimate">Intimate Dinner</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Distance Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Distance
              </label>
              <Select value={currentDistance} onValueChange={(val) => updateFilter('distance', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any distance</SelectItem>
                  <SelectItem value="5">Within 5 miles</SelectItem>
                  <SelectItem value="10">Within 10 miles</SelectItem>
                  <SelectItem value="25">Within 25 miles</SelectItem>
                  <SelectItem value="50">Within 50 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters & Clear */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-600">Active filters:</span>
              <div className="flex flex-wrap gap-2 flex-1">
                {currentCuisine && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {cuisines.find((c) => c.slug === currentCuisine)?.name || currentCuisine}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => updateFilter('cuisine', '')}
                    />
                  </Badge>
                )}
                {currentPrice && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {currentPrice === 'low' ? '£' : currentPrice === 'medium' ? '££' : '£££'}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => updateFilter('price', '')}
                    />
                  </Badge>
                )}
                {currentRating && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {currentRating}+ stars
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => updateFilter('rating', '')}
                    />
                  </Badge>
                )}
                {currentOccasion && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {occasions.find((o) => o.id === currentOccasion)?.name || currentOccasion}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => updateFilter('occasion', '')}
                    />
                  </Badge>
                )}
                {currentDistance && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Within {currentDistance} miles
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => updateFilter('distance', '')}
                    />
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="hidden lg:flex">
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
