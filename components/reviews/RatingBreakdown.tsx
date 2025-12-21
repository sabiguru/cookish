'use client';

import { useState, useEffect } from 'react';
import StarRating from './StarRating';

interface RatingStats {
  average: number;
  total: number;
  distribution: {
    [key: number]: number;
  };
}

interface RatingBreakdownProps {
  chefId: string;
}

export default function RatingBreakdown({ chefId }: RatingBreakdownProps) {
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [chefId]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/reviews/stats?chefId=${chefId}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch rating stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No ratings yet</p>
      </div>
    );
  }

  const getPercentage = (count: number) => {
    return stats.total > 0 ? (count / stats.total) * 100 : 0;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Rating Breakdown</h3>

      {/* Overall rating */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b">
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {stats.average.toFixed(1)}
          </div>
          <StarRating value={stats.average} readonly size="md" />
          <p className="text-sm text-gray-600 mt-2">
            {stats.total} {stats.total === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>

      {/* Distribution */}
      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.distribution[rating] || 0;
          const percentage = getPercentage(count);

          return (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium text-gray-700">
                  {rating}
                </span>
                <svg
                  className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>

              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              <div className="w-12 text-right">
                <span className="text-sm text-gray-600">{count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
