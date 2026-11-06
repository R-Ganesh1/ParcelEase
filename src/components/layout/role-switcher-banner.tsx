'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemo } from '@/lib/context/demo-context';
import { UserRole } from '@/types';
import {
  ShieldCheck,
  Home,
  Building2,
  Globe,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Lock,
} from 'lucide-react';
import { MockDatabase } from '@/lib/db/mock-db';

export function RoleSwitcherBanner() {
  const { currentUser, society, refreshState } = useDemo();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    // If the user is ALREADY authenticated as this role, take them to their dashboard
    if (currentUser && currentUser.role === role) {
      if (role === 'STAFF') router.push('/staff');
      else if (role === 'RESIDENT') router.push('/resident');
      else if (role === 'SOCIETY_ADMIN') router.push('/admin');
      else if (role === 'PLATFORM_ADMIN') router.push('/platform-admin');
      return;
    }

    // Otherwise, the user MUST be prompted to log in with credentials for that role!
    router.push(`/login?role=${role}&reason=switch_required`);
  };

  const handleResetData = () => {
    MockDatabase.reset();
    refreshState();
    alert('Demo database reset to clean Greenwood Heights initial state.');
  };

  return (
    <div className="bg-navy-950 text-white border-b border-navy-800 text-xs py-1.5 px-3 sm:px-4 shadow-sm select-none z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Persona status */}
        <div className="flex items-center gap-2 truncate">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] text-slate-300 truncate">
            {society.name} &bull;{' '}
            {currentUser ? (
              <span>
                Logged In: <strong className="text-white font-bold">{currentUser.full_name}</strong>{' '}
                <span className="text-blue-300">({currentUser.role.replace('_', ' ')})</span>
              </span>
            ) : (
              <span className="text-slate-400 font-medium">Logged Out (Guest)</span>
            )}
          </span>
        </div>

        {/* Right: Desktop Switch Buttons */}
        <div className="hidden lg:flex items-center gap-1.5 shrink-0">
          <span className="text-slate-400 text-[10px] mr-1">Portals:</span>

          {/* Staff */}
          <button
            onClick={() => handleRoleChange('STAFF')}
            title={currentUser?.role === 'STAFF' ? 'Active Portal' : 'Login Required: Switch to Staff Desk'}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all text-[11px] font-medium ${
              currentUser?.role === 'STAFF'
                ? 'bg-blue-600 text-white font-semibold ring-1 ring-blue-400 shadow-xs'
                : 'bg-navy-900/90 text-slate-300 hover:bg-navy-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-blue-300" />
            <span>Staff Desk</span>
            {currentUser?.role !== 'STAFF' && <Lock className="w-2.5 h-2.5 text-slate-400 ml-0.5" />}
          </button>

          {/* Resident */}
          <button
            onClick={() => handleRoleChange('RESIDENT')}
            title={currentUser?.role === 'RESIDENT' ? 'Active Portal' : 'Login Required: Switch to Resident'}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all text-[11px] font-medium ${
              currentUser?.role === 'RESIDENT'
                ? 'bg-blue-600 text-white font-semibold ring-1 ring-blue-400 shadow-xs'
                : 'bg-navy-900/90 text-slate-300 hover:bg-navy-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Home className="w-3 h-3 text-emerald-300" />
            <span>Resident (A-204)</span>
            {currentUser?.role !== 'RESIDENT' && <Lock className="w-2.5 h-2.5 text-slate-400 ml-0.5" />}
          </button>

          {/* Society Admin */}
          <button
            onClick={() => handleRoleChange('SOCIETY_ADMIN')}
            title={currentUser?.role === 'SOCIETY_ADMIN' ? 'Active Portal' : 'Login Required: Switch to Society Admin'}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all text-[11px] font-medium ${
              currentUser?.role === 'SOCIETY_ADMIN'
                ? 'bg-blue-600 text-white font-semibold ring-1 ring-blue-400 shadow-xs'
                : 'bg-navy-900/90 text-slate-300 hover:bg-navy-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Building2 className="w-3 h-3 text-amber-300" />
            <span>Admin</span>
            {currentUser?.role !== 'SOCIETY_ADMIN' && <Lock className="w-2.5 h-2.5 text-slate-400 ml-0.5" />}
          </button>

          {/* Super Admin */}
          <button
            onClick={() => handleRoleChange('PLATFORM_ADMIN')}
            title={currentUser?.role === 'PLATFORM_ADMIN' ? 'Active Portal' : 'Login Required: Switch to Super Admin'}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all text-[11px] font-medium ${
              currentUser?.role === 'PLATFORM_ADMIN'
                ? 'bg-blue-600 text-white font-semibold ring-1 ring-blue-400 shadow-xs'
                : 'bg-navy-900/90 text-slate-300 hover:bg-navy-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <Globe className="w-3 h-3 text-purple-300" />
            <span>Super</span>
            {currentUser?.role !== 'PLATFORM_ADMIN' && <Lock className="w-2.5 h-2.5 text-slate-400 ml-0.5" />}
          </button>

          <button
            onClick={handleResetData}
            title="Reset demo data"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-navy-800 ml-0.5"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {/* Mobile Expand / Toggle Button */}
        <div className="flex lg:hidden items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-navy-800 text-[10px] text-slate-300 hover:text-white font-medium"
          >
            <span>Portals</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expanded mobile panel */}
      {isExpanded && (
        <div className="lg:hidden mt-2 pt-2 border-t border-navy-800 grid grid-cols-2 gap-1.5 animate-in fade-in">
          <button
            onClick={() => {
              handleRoleChange('STAFF');
              setIsExpanded(false);
            }}
            className="p-1.5 rounded bg-navy-900 text-slate-200 text-left text-[11px] flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Staff Guard
            </span>
            {currentUser?.role !== 'STAFF' && <Lock className="w-2.5 h-2.5 text-slate-400" />}
          </button>
          <button
            onClick={() => {
              handleRoleChange('RESIDENT');
              setIsExpanded(false);
            }}
            className="p-1.5 rounded bg-navy-900 text-slate-200 text-left text-[11px] flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-emerald-400" /> Resident (A-204)
            </span>
            {currentUser?.role !== 'RESIDENT' && <Lock className="w-2.5 h-2.5 text-slate-400" />}
          </button>
          <button
            onClick={() => {
              handleRoleChange('SOCIETY_ADMIN');
              setIsExpanded(false);
            }}
            className="p-1.5 rounded bg-navy-900 text-slate-200 text-left text-[11px] flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" /> Society Admin
            </span>
            {currentUser?.role !== 'SOCIETY_ADMIN' && <Lock className="w-2.5 h-2.5 text-slate-400" />}
          </button>
          <button
            onClick={() => {
              handleRoleChange('PLATFORM_ADMIN');
              setIsExpanded(false);
            }}
            className="p-1.5 rounded bg-navy-900 text-slate-200 text-left text-[11px] flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-purple-400" /> Super Admin
            </span>
            {currentUser?.role !== 'PLATFORM_ADMIN' && <Lock className="w-2.5 h-2.5 text-slate-400" />}
          </button>
        </div>
      )}
    </div>
  );
}
