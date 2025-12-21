'use client';

import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  createdAt: Date;
  currentPeriodEnd: Date | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface SubscriptionsListProps {
  subscriptions: Subscription[];
}

const planColors = {
  BASIC: 'bg-gray-100 text-gray-800',
  PRO: 'bg-blue-100 text-blue-800',
  ELITE: 'bg-purple-100 text-purple-800',
};

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  CANCELED: 'bg-red-100 text-red-800',
  PAST_DUE: 'bg-orange-100 text-orange-800',
  UNPAID: 'bg-yellow-100 text-yellow-800',
  TRIALING: 'bg-blue-100 text-blue-800',
};

export function SubscriptionsList({ subscriptions }: SubscriptionsListProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No subscriptions found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Started
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Renews
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {subscriptions.map((subscription) => (
            <tr key={subscription.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {subscription.user.name || 'Unnamed User'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {subscription.user.email}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge
                  className={
                    planColors[subscription.plan as keyof typeof planColors] ||
                    'bg-gray-100 text-gray-800'
                  }
                  variant="secondary"
                >
                  {subscription.plan}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge
                  className={
                    statusColors[
                      subscription.status as keyof typeof statusColors
                    ] || 'bg-gray-100 text-gray-800'
                  }
                  variant="secondary"
                >
                  {subscription.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDistanceToNow(new Date(subscription.createdAt), {
                  addSuffix: true,
                })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {subscription.currentPeriodEnd
                  ? formatDistanceToNow(
                      new Date(subscription.currentPeriodEnd),
                      {
                        addSuffix: true,
                      }
                    )
                  : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
