'use client';

import { ArrowLeftRight, User as UserIcon, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DashboardTopBarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  userRole?: string;
  currentDashboard?: 'user' | 'chef';
}

export default function DashboardTopBar({ user, userRole, currentDashboard = 'user' }: DashboardTopBarProps) {
  const isChef = userRole === 'CHEF' || userRole === 'chef';
  const switchTo = currentDashboard === 'user' ? '/chef' : '/user';
  const switchLabel = currentDashboard === 'user' ? 'Chef Dashboard' : 'User Dashboard';
  const switchIcon = currentDashboard === 'user' ? ChefHat : UserIcon;
  const SwitchIcon = switchIcon;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentDashboard === 'user' ? 'User Dashboard' : 'Chef Dashboard'}
          </h1>
          <p className="text-sm text-gray-600">Welcome back, {user.name || user.email?.split('@')[0] || 'User'}!</p>
        </div>

        {/* Dashboard Switcher - Only show if user is a chef */}
        {isChef && (
          <Button asChild variant="outline" className="gap-2 rounded-xl">
            <Link href={switchTo}>
              <SwitchIcon className="h-4 w-4" />
              {switchLabel}
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
