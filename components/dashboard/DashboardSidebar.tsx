'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Calendar,
  Heart,
  User,
  AlertCircle,
  ChefHat,
  UtensilsCrossed,
  Clock,
  DollarSign,
  Award,
  Menu,
  X,
  Users,
  CreditCard,
  Package,
  Settings,
  FileText,
  Shield,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardSidebarProps {
  userRole: 'USER' | 'CHEF' | 'ADMIN' | 'STAFF';
}

const userMenuItems = [
  { icon: Home, label: 'Overview', href: '/user' },
  { icon: Calendar, label: 'My Bookings', href: '/user/bookings' },
  { icon: Heart, label: 'Favourites', href: '/user/favourites' },
  { icon: User, label: 'Profile', href: '/user/profile' },
  { icon: AlertCircle, label: 'Disputes', href: '/user/disputes' },
];

const chefMenuItems = [
  { icon: Home, label: 'Overview', href: '/chef' },
  { icon: Calendar, label: 'Bookings', href: '/chef/bookings' },
  { icon: UtensilsCrossed, label: 'Menus', href: '/chef/menus' },
  { icon: Clock, label: 'Availability', href: '/chef/availability' },
  { icon: DollarSign, label: 'Payouts', href: '/chef/payouts' },
  { icon: Wallet, label: 'Subscription', href: '/chef/subscription' },
  { icon: Award, label: 'Certifications', href: '/chef/certifications' },
  { icon: Package, label: 'Procurement', href: '/chef/procurement' },
];

const adminMenuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard/admin' },
  { icon: Users, label: 'Chefs', href: '/dashboard/admin/chefs' },
  { icon: Calendar, label: 'Bookings', href: '/dashboard/admin/bookings' },
  { icon: CreditCard, label: 'Payments', href: '/dashboard/admin/payments' },
  { icon: Wallet, label: 'Billing', href: '/dashboard/admin/billing' },
  { icon: AlertCircle, label: 'Disputes', href: '/dashboard/admin/disputes' },
  { icon: Package, label: 'Catalog', href: '/dashboard/admin/catalog' },
  { icon: FileText, label: 'CMS', href: '/dashboard/admin/cms' },
  { icon: Shield, label: 'Audit Logs', href: '/dashboard/admin/logs' },
];

const staffMenuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard/staff' },
  { icon: AlertCircle, label: 'My Disputes', href: '/dashboard/staff/disputes' },
  { icon: Calendar, label: 'Bookings', href: '/dashboard/staff/bookings' },
];

export default function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems =
    userRole === 'ADMIN' ? adminMenuItems :
    userRole === 'STAFF' ? staffMenuItems :
    userRole === 'CHEF' ? chefMenuItems :
    userMenuItems;

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md rounded-xl"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 transition-transform duration-300 z-40',
          'w-64 flex flex-col',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">CookFort</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            {userRole === 'ADMIN' ? 'Admin Panel' :
             userRole === 'STAFF' ? 'Staff Dashboard' :
             userRole === 'CHEF' ? 'Chef Dashboard' :
             'User Dashboard'}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}
    </>
  );
}
