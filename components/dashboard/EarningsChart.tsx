'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EarningsChartProps {
  data: Array<{
    date: string;
    earnings: number;
  }>;
}

export default function EarningsChart({ data }: EarningsChartProps) {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader className="border-b">
        <CardTitle>Earnings Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis
              dataKey="date"
              className="text-sm"
              tick={{ fill: '#6b7280' }}
            />
            <YAxis
              className="text-sm"
              tick={{ fill: '#6b7280' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Earnings']}
            />
            <Line
              type="monotone"
              dataKey="earnings"
              stroke="#111"
              strokeWidth={2}
              dot={{ fill: '#111', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
