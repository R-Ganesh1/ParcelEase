'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDemo } from '@/lib/context/demo-context';
import {
  LayoutDashboard,
  PackagePlus,
  ShieldCheck,
  Package,
  CalendarCheck,
  Building,
  Users,
  Settings,
  BarChart3,
  Home,
  HelpCircle,
  Globe,
  Clock,
} from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { currentUser } = useDemo();

  // If on login or register, don't obstruct keyboard with bottom nav
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  // Define role-specific items (max 5 items for clean mobile bottom bar)
  const staffItems = [
    { label: 'Guard Hub', href: '/staff', icon: LayoutDashboard },
    { label: 'Register', href: '/staff/register', icon: PackagePlus, highlight: true },
    { label: 'Verify OTP', href: '/staff/handover', icon: ShieldCheck, highlight: true },
    { label: 'Parcels', href: '/staff/parcels', icon: Package },
    { label: 'Schedules', href: '/staff/schedule', icon: CalendarCheck },
  ];

  const residentItems = [
    { label: 'Overview', href: '/resident', icon: LayoutDashboard },
    { label: 'My Parcels', href: '/resident/parcels', icon: Package },
    { label: 'Bookings', href: '/resident/bookings', icon: CalendarCheck },
    { label: 'Support', href: '/resident/support', icon: HelpCircle },
    { label: 'Unit Profile', href: '/resident/profile', icon: Settings },
  ];

  const adminItems = [
    { label: 'Analytics', href: '/admin', icon: BarChart3 },
    { label: 'Units', href: '/admin/apartments', icon: Building },
    { label: 'Staff', href: '/admin/staff', icon: Users },
    { label: 'Hours & Slots', href: '/admin/schedules', icon: Clock },
    { label: 'Parcels', href: '/admin/parcels', icon: Package },
  ];

  const platformItems = [
    { label: 'Metrics', href: '/platform-admin', icon: BarChart3 },
    { label: 'Societies', href: '/platform-admin/societies', icon: Building },
    { label: 'Audits', href: '/platform-admin/audit', icon: ShieldCheck },
  ];

  const publicItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Features', href: '/features', icon: Package },
    { label: 'How It Works', href: '/how-it-works', icon: CalendarCheck },
    { label: 'Pricing', href: '/pricing', icon: BarChart3 },
    { label: 'Sign In', href: '/login', icon: ShieldCheck, highlight: true },
  ];

  let items = publicItems;
  if (currentUser) {
    if (currentUser.role === 'STAFF') items = staffItems;
    else if (currentUser.role === 'RESIDENT') items = residentItems;
    else if (currentUser.role === 'SOCIETY_ADMIN') items = adminItems;
    else if (currentUser.role === 'PLATFORM_ADMIN') items = platformItems;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all text-[10px] font-medium min-w-[56px] ${
                isActive
                  ? 'text-blue-600 font-bold scale-105'
                  : item.highlight
                  ? 'text-blue-700 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div
                className={`p-1 rounded-full ${
                  item.highlight && !isActive
                    ? 'bg-blue-50 text-blue-600'
                    : isActive
                    ? 'bg-blue-100 text-blue-700'
                    : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="mt-0.5 truncate max-w-[64px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
