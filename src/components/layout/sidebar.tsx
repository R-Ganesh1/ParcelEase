'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDemo } from '@/lib/context/demo-context';
import {
  LayoutDashboard,
  PackagePlus,
  PackageCheck,
  Package,
  CalendarCheck,
  ShieldCheck,
  Building,
  Users,
  Settings,
  BarChart3,
  HelpCircle,
  FileText,
  Clock,
  Sparkles,
  QrCode,
  AlertTriangle,
  LogOut,
  MessageSquareWarning,
  AlertCircle,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, logout } = useDemo();
  const router = useRouter();

  // Resident Nav Links
  const residentLinks: NavItem[] = [
    { label: 'Overview', href: '/resident', icon: LayoutDashboard },
    { label: 'My Parcels', href: '/resident/parcels', icon: Package },
    { label: 'Scheduled Bookings', href: '/resident/bookings', icon: CalendarCheck },
    { label: 'Complaints', href: '/resident/complaints', icon: MessageSquareWarning, highlight: true },
    { label: 'Report / Help Desk', href: '/resident/support', icon: HelpCircle },
    { label: 'Apartment Profile', href: '/resident/profile', icon: Settings },
  ];

  // Staff Nav Links
  const staffLinks: NavItem[] = [
    { label: 'Guard Desk Hub', href: '/staff', icon: LayoutDashboard },
    { label: 'Register Parcel', href: '/staff/register', icon: PackagePlus, highlight: true },
    { label: 'Parcel Inventory', href: '/staff/parcels', icon: Package },
    { label: 'Handover Terminal', href: '/staff/handover', icon: ShieldCheck, highlight: true },
    { label: 'Daily Schedules', href: '/staff/schedule', icon: CalendarCheck },
    { label: 'Staff Activity Log', href: '/staff/audit', icon: Clock },
    { label: 'Assigned Complaints', href: '/staff/complaints', icon: AlertCircle, highlight: true },
  ];

  // Society Admin Nav Links
  const adminLinks: NavItem[] = [
    { label: 'Executive Analytics', href: '/admin', icon: BarChart3 },
    { label: 'Apartment Directory', href: '/admin/apartments', icon: Building },
    { label: 'Security Staff', href: '/admin/staff', icon: Users },
    { label: 'Complaint Management', href: '/admin/complaints', icon: MessageSquareWarning, highlight: true },
    { label: 'Operating & Slots', href: '/admin/schedules', icon: Clock },
    { label: 'Master Parcel Ledger', href: '/admin/parcels', icon: Package },
    { label: 'Reports & Export', href: '/admin/reports', icon: FileText },
    { label: 'Society Settings', href: '/admin/settings', icon: Settings },
  ];

  // Platform Admin Nav Links
  const platformLinks: NavItem[] = [
    { label: 'Platform Metrics', href: '/platform-admin', icon: BarChart3 },
    { label: 'Societies Directory', href: '/platform-admin/societies', icon: Building },
    { label: 'Security & Audits', href: '/platform-admin/audit', icon: ShieldCheck },
  ];

  let activeLinks: NavItem[] = residentLinks;
  let roleTitle = 'Resident Portal';

  if (currentUser?.role === 'STAFF') {
    activeLinks = staffLinks;
    roleTitle = 'Security Staff Desk';
  } else if (currentUser?.role === 'SOCIETY_ADMIN') {
    activeLinks = adminLinks;
    roleTitle = 'Society Management';
  } else if (currentUser?.role === 'PLATFORM_ADMIN') {
    activeLinks = platformLinks;
    roleTitle = 'Platform Headquarters';
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-100px)] p-4 flex flex-col justify-between hidden md:flex shrink-0 border-r border-slate-800">
      <div>
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-3 flex items-center justify-between">
          <span>{roleTitle}</span>
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        </div>

        <nav className="space-y-1">
          {activeLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                    : item.highlight
                    ? 'text-blue-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.highlight && !isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Logout Action */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        {currentUser && (
          <div className="px-3 py-2 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.full_name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-xs text-white truncate">{currentUser.full_name}</div>
                <div className="text-[10px] text-slate-400 truncate">{currentUser.role.replace('_', ' ')}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Log Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700/50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="p-2.5 rounded-xl bg-slate-800/40 text-[11px] text-slate-400 leading-snug">
          Support: 1800-PARCEL (Toll Free)
        </div>
      </div>
    </aside>
  );
}
