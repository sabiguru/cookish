'use client';

import { formatCurrency } from '@/lib/utils';

interface RevenueData {
  week: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="space-y-4">
      {/* Simple bar chart */}
      <div className="flex items-end justify-between gap-4 h-64">
        {data.map((item, index) => {
          const height = (item.revenue / maxRevenue) * 100;

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center justify-end gap-2"
            >
              <div className="text-sm font-semibold text-gray-700">
                {formatCurrency(item.revenue)}
              </div>
              <div
                className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all hover:from-green-600 hover:to-green-500"
                style={{ height: `${Math.max(height, 5)}%` }}
              />
              <div className="text-xs text-gray-600 font-medium mt-2">
                {item.week}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">Revenue from subscriptions</span>
        </div>
      </div>
    </div>
  );
}
