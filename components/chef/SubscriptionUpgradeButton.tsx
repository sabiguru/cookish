'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SubscriptionUpgradeButtonProps {
  planKey: 'BASIC' | 'PRO' | 'ELITE';
  planName: string;
  currentPlan: string;
}

export function SubscriptionUpgradeButton({
  planKey,
  planName,
  currentPlan,
}: SubscriptionUpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      alert('Failed to start upgrade process. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-full"
      onClick={handleUpgrade}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <TrendingUp className="mr-2 h-4 w-4" />
          {currentPlan === 'BASIC' ? 'Upgrade' : 'Change'} to {planName}
        </>
      )}
    </Button>
  );
}
