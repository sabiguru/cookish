'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar, MessageCircle, Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface ChefActionButtonsProps {
  chefId: string;
  chefName: string;
}

export default function ChefActionButtons({ chefId, chefName }: ChefActionButtonsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isFavorited, setIsFavorited] = useState(false);

  const handleBookNow = () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/chef/' + chefId);
      return;
    }
    // Navigate to booking page
    router.push(`/booking?chefId=${chefId}`);
  };

  const handleContactChef = () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/chef/' + chefId);
      return;
    }
    // Navigate to messages page (in dashboard)
    router.push('/messages');
  };

  const handleToggleFavorite = async () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/chef/' + chefId);
      return;
    }

    try {
      const response = await fetch('/api/favorites', {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chefId }),
      });

      if (response.ok) {
        setIsFavorited(!isFavorited);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        size="lg"
        onClick={handleBookNow}
        className="bg-white text-gray-900 hover:bg-gray-100 rounded-xl px-8 shadow-lg"
      >
        <Calendar className="h-5 w-5 mr-2" />
        Book Now
      </Button>
      <button
        onClick={handleContactChef}
        className="inline-flex items-center justify-center h-10 px-8 rounded-xl text-white bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 transition-all font-medium shadow-lg"
      >
        <MessageCircle className="h-5 w-5 mr-2" />
        Contact Chef
      </button>
      <button
        onClick={handleToggleFavorite}
        className={`inline-flex items-center justify-center h-10 w-10 rounded-xl transition-all shadow-lg ${
          isFavorited
            ? 'bg-white text-red-500'
            : 'text-white bg-transparent border-2 border-white hover:bg-white hover:text-gray-900'
        }`}
      >
        <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}
