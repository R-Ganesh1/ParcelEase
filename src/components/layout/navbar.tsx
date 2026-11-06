'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Package,
  Bell,
  Shield,
  User,
  Menu,
  X,
  CheckCheck,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  PackagePlus,
  ShieldCheck,
  CalendarCheck,
  Settings,
  HelpCircle,
  Building,
  BarChart3,
  Globe,
  Sparkles,
  Lock,
  MessageSquareWarning,
  AlertCircle,
} from 'lucide-react';
import { useDemo } from '@/lib/context/demo-context';
import { MockDatabase } from '@/lib/db/mock-db';
import { formatIST } from '@/lib/scheduling/engine';
import { UserRole } from '@/types';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, society, unreadCount, refreshState, logout } = useDemo();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isPublicPage =
    pathname === '/' ||
    pathname.startsWith('/features') ||
    pathname.startsWith('/how-it-works') ||
    pathname.startsWith('/for-societies') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register');

  const notifications = currentUser
    ? MockDatabase.getNotifications(
        currentUser.role === 'RESIDENT' ? currentUser.id : undefined
      ).slice(0, 5)
    : [];

  const handleMarkAllRead = () => {
    notifications.forEach((n) => MockDatabase.markNotificationRead(n.id));
    refreshState();
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
    router.push('/login');
  };

  const handleSwitchPersona = (role: UserRole) => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);

    if (currentUser && currentUser.role === role) {
      if (role === 'STAFF') router.push('/staff');
      else if (role === 'RESIDENT') router.push('/resident');
      else if (role === 'SOCIETY_ADMIN') router.push('/admin');
      else if (role === 'PLATFORM_ADMIN') router.push('/platform-admin');
      return;
    }

    // Direct user to log in for the requested role
    router.push(`/login?role=${role}&reason=switch_required`);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-navy-950 tracking-tight leading-none">
                  Parcel<span className="text-blue-600">Ease</span>
                </span>
                <span className="text-[10px] text-slate-500 tracking-wider font-medium uppercase mt-0.5">
                  Your parcels. Your time.
                </span>
              </div>
            </Link>

            {/* Public Links */}
            {isPublicPage && (
              <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
                <Link href="/features" className="hover:text-blue-600 transition-colors">
                  Features
                </Link>
                <Link href="/how-it-works" className="hover:text-blue-600 transition-colors">
                  How it Works
                </Link>
                <Link href="/for-societies" className="hover:text-blue-600 transition-colors">
                  For Societies
                </Link>
                <Link href="/pricing" className="hover:text-blue-600 transition-colors">
                  Pricing
                </Link>
              </nav>
            )}
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* If on homepage OR not logged in, show clean Sign In / Register public actions */}
            {(!currentUser || pathname === '/') && (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-lg text-xs font-bold text-slate-700 hover:text-navy-950 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* If logged in AND not on homepage: Notification Bell */}
            {currentUser && pathname !== '/' && (
              <div className="relative" ref={notifMenuRef}>
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setProfileDropdownOpen(false);
                  }}
                  className="relative p-2 rounded-xl text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-navy-900">
                        <Bell className="w-3.5 h-3.5 text-blue-600" />
                        <span>In-App Notifications</span>
                      </div>
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark read
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">No new notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 text-xs transition-colors hover:bg-slate-50 ${
                              !n.read ? 'bg-blue-50/40' : ''
                            }`}
                          >
                            <div className="font-semibold text-slate-900 flex items-center justify-between">
                              <span>{n.title}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {formatIST(n.created_at)}
                              </span>
                            </div>
                            <p className="mt-1 text-slate-600 leading-snug text-[11px]">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* If logged in AND not on homepage: User Profile Button & Interactive Dropdown */}
            {currentUser && pathname !== '/' && (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotifDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all select-none text-left"
                  aria-label="User profile menu"
                >
                  <div className="w-8 h-8 rounded-full bg-navy-950 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-slate-200">
                    {currentUser.full_name.charAt(0)}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-navy-950 leading-tight">
                      {currentUser.full_name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {currentUser.role === 'RESIDENT'
                        ? `Apt ${currentUser.apartment_number}`
                        : currentUser.role.replace('_', ' ')}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform hidden sm:inline ${
                      profileDropdownOpen ? 'rotate-180 text-navy-950' : ''
                    }`}
                  />
                </button>

                {/* Profile Dropdown Popover */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95">
                    {/* User Profile Header */}
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-navy-950 text-white flex items-center justify-center font-black text-sm shadow-md">
                        {currentUser.full_name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-sm text-navy-950 truncate">
                          {currentUser.full_name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            {currentUser.role.replace('_', ' ')}
                          </span>
                          {currentUser.apartment_number && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                              Unit {currentUser.apartment_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Society Info */}
                    <div className="px-4 py-2 bg-slate-50 text-[11px] text-slate-500 border-b border-slate-100 flex items-center justify-between">
                      <span>Community:</span>
                      <strong className="text-navy-900 font-semibold">{society.name}</strong>
                    </div>

                    {/* Quick Portal Navigation */}
                    <div className="p-2 space-y-0.5 text-xs">
                      {currentUser.role === 'STAFF' && (
                        <>
                          <Link
                            href="/staff"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-navy-950 font-medium"
                          >
                            <LayoutDashboard className="w-4 h-4 text-blue-600" />
                            <span>Guard Desk Hub</span>
                          </Link>
                          <Link
                            href="/staff/register"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-navy-950 font-medium"
                          >
                            <PackagePlus className="w-4 h-4 text-blue-600" />
                            <span>Register Incoming Parcel</span>
                          </Link>
                          <Link
                            href="/staff/handover"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-navy-950 font-medium"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Verify Handover (OTP)</span>
                          </Link>
                          <Link
                            href="/staff/complaints"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-navy-950 font-medium"
                          >
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span>Assigned Complaints</span>
                          </Link>
                        </>
                      )}

                      {currentUser.role === 'RESIDENT' && (
                        <>
                          <Link
                            href="/resident"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-navy-950 font-medium"
                          >
                            <LayoutDashboard className="w-4 h-4 text-blue-600" />
                            <span>Resident Overview</span>
                          </Link>
                          <Link
                            href="/resident/parcels"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-navy-950 font-medium"
                          >
                            <Package className="w-4 h-4 text-blue-600" />
                            <span>My Apartment Parcels</span>
                          </Link>
                          <Link
                            href="/resident/bookings"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-navy-950 font-medium"
                          >
                            <CalendarCheck className="w-4 h-4 text-purple-600" />
                            <span>Scheduled Passes &amp; OTP</span>
                          </Link>
                          <Link
                            href="/resident/complaints"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-navy-950 font-medium"
                          >
                            <MessageSquareWarning className="w-4 h-4 text-amber-600" />
                            <span>Complaints &amp; Grievances</span>
                          </Link>
                          <Link
                            href="/resident/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-navy-950 font-medium"
                          >
                            <Settings className="w-4 h-4 text-slate-500" />
                            <span>Notification Preferences</span>
                          </Link>
                        </>
                      )}

                      {currentUser.role === 'SOCIETY_ADMIN' && (
                        <>
                          <Link
                            href="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-navy-950 font-medium"
                          >
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                            <span>Executive Analytics</span>
                          </Link>
                          <Link
                            href="/admin/complaints"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-navy-950 font-medium"
                          >
                            <MessageSquareWarning className="w-4 h-4 text-amber-600" />
                            <span>Complaint Management</span>
                          </Link>
                          <Link
                            href="/admin/schedules"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-navy-950 font-medium"
                          >
                            <Settings className="w-4 h-4 text-slate-500" />
                            <span>Operating Hours &amp; Slots</span>
                          </Link>
                        </>
                      )}

                      {currentUser.role === 'PLATFORM_ADMIN' && (
                        <>
                          <Link
                            href="/platform-admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-navy-950 font-medium"
                          >
                            <Globe className="w-4 h-4 text-purple-600" />
                            <span>Platform Headquarters</span>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Switch Portal Section (Requires Login) */}
                    <div className="pt-2 border-t border-slate-100 px-3 pb-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Switch Portal
                        </span>
                        <span className="text-[9px] text-amber-600 font-semibold flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> Login Required
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleSwitchPersona('STAFF')}
                          className={`px-2 py-1.5 rounded-md text-left transition-colors truncate flex items-center justify-between ${
                            currentUser.role === 'STAFF'
                              ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                          }`}
                        >
                          <span>🛡️ Staff Desk</span>
                          {currentUser.role !== 'STAFF' && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSwitchPersona('RESIDENT')}
                          className={`px-2 py-1.5 rounded-md text-left transition-colors truncate flex items-center justify-between ${
                            currentUser.role === 'RESIDENT'
                              ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                          }`}
                        >
                          <span>🏠 Resident</span>
                          {currentUser.role !== 'RESIDENT' && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSwitchPersona('SOCIETY_ADMIN')}
                          className={`px-2 py-1.5 rounded-md text-left transition-colors truncate flex items-center justify-between ${
                            currentUser.role === 'SOCIETY_ADMIN'
                              ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                          }`}
                        >
                          <span>🏢 Society Admin</span>
                          {currentUser.role !== 'SOCIETY_ADMIN' && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSwitchPersona('PLATFORM_ADMIN')}
                          className={`px-2 py-1.5 rounded-md text-left transition-colors truncate flex items-center justify-between ${
                            currentUser.role === 'PLATFORM_ADMIN'
                              ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                          }`}
                        >
                          <span>🌐 Super Admin</span>
                          {currentUser.role !== 'PLATFORM_ADMIN' && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                        </button>
                      </div>
                    </div>

                    {/* LOGOUT BUTTON */}
                    <div className="pt-2 border-t border-slate-100 p-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs text-red-600 hover:text-white hover:bg-red-600 transition-all group"
                      >
                        <LogOut className="w-4 h-4 text-red-500 group-hover:text-white transition-colors" />
                        <span>Log Out from Account</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-2 shadow-xl">
          {currentUser && pathname !== '/' ? (
            <div className="space-y-3">
              {/* Profile Card on Mobile */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-navy-950 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {currentUser.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-navy-950">{currentUser.full_name}</div>
                    <div className="text-[10px] text-slate-500">
                      {currentUser.role.replace('_', ' ')}
                      {currentUser.apartment_number && ` • Apt ${currentUser.apartment_number}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Navigation Links */}
              <div className="space-y-1 text-xs">
                {currentUser.role === 'STAFF' && (
                  <>
                    <Link
                      href="/staff"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-100 font-semibold text-slate-800"
                    >
                      Guard Desk Hub
                    </Link>
                    <Link
                      href="/staff/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-100 font-semibold text-blue-700 bg-blue-50"
                    >
                      + Register Incoming Parcel
                    </Link>
                    <Link
                      href="/staff/handover"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-100 font-semibold text-emerald-700 bg-emerald-50"
                    >
                      Verify Handover (OTP)
                    </Link>
                    <Link
                      href="/staff/parcels"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                    >
                      Parcel Inventory
                    </Link>
                    <Link
                      href="/staff/schedule"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                    >
                      Daily Schedules
                    </Link>
                    <Link
                      href="/staff/audit"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                    >
                      Staff Activity Log
                    </Link>
                    <Link
                      href="/staff/complaints"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-100 text-amber-700 font-semibold bg-amber-50"
                    >
                      Assigned Complaints
                    </Link>
                  </>
                )}

                {currentUser.role === 'RESIDENT' && (
                  <>
                    <Link
                      href="/resident"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-100 font-semibold text-slate-800"
                    >
                      Resident Overview
                    </Link>
                    <Link
                      href="/resident/parcels"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                    >
                      My Apartment Parcels
                    </Link>
                    <Link
                      href="/resident/bookings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                    >
                      Scheduled Passes
                    </Link>
                    <Link
                      href="/resident/complaints"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-100 text-amber-700 font-semibold bg-amber-50"
                    >
                      Complaints &amp; Grievances
                    </Link>
                    <Link
                      href="/resident/support"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                    >
                      Help &amp; Missing Parcel
                    </Link>
                    <Link
                      href="/resident/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                    >
                      Unit Preferences
                    </Link>
                  </>
                )}

                {currentUser.role === 'SOCIETY_ADMIN' && (
                  <>
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-100 font-semibold text-slate-800"
                    >
                      Executive Analytics
                    </Link>
                    <Link
                      href="/admin/complaints"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-100 text-amber-700 font-semibold bg-amber-50"
                    >
                      Complaint Management
                    </Link>
                    <Link
                      href="/admin/apartments"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                    >
                      Apartment Directory
                    </Link>
                    <Link
                      href="/admin/staff"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                    >
                      Security Staff Roster
                    </Link>
                    <Link
                      href="/admin/schedules"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                    >
                      Operating Hours &amp; Slots
                    </Link>
                    <Link
                      href="/admin/reports"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                    >
                      Export CSV Reports
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Logout Button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              <Link
                href="/features"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
              >
                Features
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
              >
                How it Works
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
              >
                Pricing
              </Link>
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-slate-100 text-navy-950 font-bold"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Register Account
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
