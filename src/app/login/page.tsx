'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDemo } from '@/lib/context/demo-context';
import { UserRole } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShieldCheck,
  Home,
  Building2,
  Globe,
  ArrowRight,
  Lock,
  Mail,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Loader2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams?.get('role') as UserRole) || 'STAFF';
  const initialEmail = searchParams?.get('email') || '';
  const redirectUrl = searchParams?.get('redirect');
  const reason = searchParams?.get('reason');

  const { currentUser, login, switchRole } = useDemo();

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState(
    initialEmail ||
      (initialRole === 'RESIDENT'
        ? 'resident@parcelease.in'
        : initialRole === 'SOCIETY_ADMIN'
        ? 'admin@parcelease.in'
        : initialRole === 'PLATFORM_ADMIN'
        ? 'platform@parcelease.in'
        : 'staff@parcelease.in')
  );
  const [password, setPassword] = useState('password123');

  // React to URL changes (e.g. clicking a portal switch button)
  React.useEffect(() => {
    const roleParam = searchParams?.get('role') as UserRole;
    if (roleParam && ['STAFF', 'RESIDENT', 'SOCIETY_ADMIN', 'PLATFORM_ADMIN'].includes(roleParam)) {
      handleRoleTabChange(roleParam);
    }
  }, [searchParams]);

  const [errorInfo, setErrorInfo] = useState<{
    type?: 'USER_NOT_REGISTERED' | 'INVALID_PASSWORD' | 'ROLE_MISMATCH' | 'GENERAL';
    message?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorInfo(null);
    if (role === 'RESIDENT') setEmail('resident@parcelease.in');
    else if (role === 'STAFF') setEmail('staff@parcelease.in');
    else if (role === 'SOCIETY_ADMIN') setEmail('admin@parcelease.in');
    else if (role === 'PLATFORM_ADMIN') setEmail('platform@parcelease.in');
    setPassword('password123');
  };

  const getDashboardUrl = (role: UserRole) => {
    switch (role) {
      case 'RESIDENT': return '/resident';
      case 'STAFF': return '/staff';
      case 'SOCIETY_ADMIN': return '/admin';
      case 'PLATFORM_ADMIN': return '/platform-admin';
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorInfo(null);

    const result = login(email.trim(), password.trim(), selectedRole);

    if (!result.success) {
      setErrorInfo({
        type: result.error,
        message: result.message,
      });
      setIsLoading(false);
      return;
    }

    // Success! Redirect to target dashboard or requested redirect path
    const target = redirectUrl || getDashboardUrl(result.profile?.role || selectedRole);
    router.push(target);
  };

  const handleQuickLogin = (role: UserRole) => {
    switchRole(role);
    const target = redirectUrl || getDashboardUrl(role);
    router.push(target);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-[calc(100vh-140px)]">
      <div className="w-full max-w-md space-y-6">
        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-extrabold text-navy-950 tracking-tight">Sign In to ParcelEase</h1>
          <p className="text-xs text-slate-500">Select your role and enter your credentials to open your dashboard</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleRoleTabChange('STAFF')}
            className={`py-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
              selectedRole === 'STAFF'
                ? 'bg-white text-navy-950 shadow-sm'
                : 'text-slate-600 hover:text-navy-950'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="text-[11px]">Staff</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('RESIDENT')}
            className={`py-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
              selectedRole === 'RESIDENT'
                ? 'bg-white text-navy-950 shadow-sm'
                : 'text-slate-600 hover:text-navy-950'
            }`}
          >
            <Home className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px]">Resident</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('SOCIETY_ADMIN')}
            className={`py-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
              selectedRole === 'SOCIETY_ADMIN'
                ? 'bg-white text-navy-950 shadow-sm'
                : 'text-slate-600 hover:text-navy-950'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-600" />
            <span className="text-[11px]">Admin</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('PLATFORM_ADMIN')}
            className={`py-2 rounded-lg transition-all flex flex-col items-center gap-1 ${
              selectedRole === 'PLATFORM_ADMIN'
                ? 'bg-white text-navy-950 shadow-sm'
                : 'text-slate-600 hover:text-navy-950'
            }`}
          >
            <Globe className="w-4 h-4 text-purple-600" />
            <span className="text-[11px]">Super</span>
          </button>
        </div>

        {/* Portal Switch Authentication Notice */}
        {currentUser && currentUser.role !== selectedRole && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 shadow-xs animate-in fade-in">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Authentication Required to Access Portal</p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                You are currently signed in as <strong>{currentUser.full_name} ({currentUser.role.replace('_', ' ')})</strong>.
                To enter the <strong>{selectedRole.replace('_', ' ')}</strong> portal, please verify your credentials below.
              </p>
            </div>
          </div>
        )}

        {/* Credentials Form */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-navy-950">
              {selectedRole === 'RESIDENT'
                ? 'Resident Apartment Portal'
                : selectedRole === 'STAFF'
                ? 'Security Guard Gate Terminal'
                : selectedRole === 'SOCIETY_ADMIN'
                ? 'RWA Society Management'
                : 'Platform Headquarters'}
            </CardTitle>
            <CardDescription className="text-xs">
              Enter registered credentials for {selectedRole.replace('_', ' ')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorInfo(null);
                }}
                placeholder="name@society.in"
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorInfo(null);
                }}
                required
              />

              {/* Error & Registration Prompt */}
              {errorInfo && (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <div>
                      <div className="font-bold">{errorInfo.message}</div>
                    </div>
                  </div>

                  {/* If user is not registered, provide direct registration card */}
                  {errorInfo.type === 'USER_NOT_REGISTERED' && (
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-blue-900">
                        <UserPlus className="w-4 h-4 text-blue-600" />
                        <span>Register Your Account Now</span>
                      </div>
                      <p className="text-slate-600 leading-snug">
                        Create a new <strong>{selectedRole.replace('_', ' ')}</strong> profile with this email address in less than 30 seconds.
                      </p>
                      <Link
                        href={`/register?role=${selectedRole}&email=${encodeURIComponent(email)}`}
                        className="inline-flex w-full"
                      >
                        <Button
                          type="button"
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-9 shadow-sm"
                        >
                          Register as {selectedRole.replace('_', ' ')} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs h-10 shadow-sm"
              >
                Sign In to Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <div className="pt-2 text-center border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  New to ParcelEase?{' '}
                  <Link
                    href={`/register?role=${selectedRole}`}
                    className="font-bold text-blue-600 hover:underline inline-flex items-center gap-0.5"
                  >
                    Register here <ArrowRight className="w-3 h-3" />
                  </Link>
                </span>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 1-Click Fast Persona Switcher Chips */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-navy-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Instant 1-Click Test Personas
            </span>
            <span className="text-[10px] text-slate-400">Password: password123</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('STAFF')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition-all"
            >
              <div className="font-bold text-navy-950 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-600" /> Staff Guard
              </div>
              <div className="text-[10px] text-slate-500">staff@parcelease.in</div>
            </button>

            <button
              onClick={() => handleQuickLogin('RESIDENT')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all"
            >
              <div className="font-bold text-navy-950 flex items-center gap-1">
                <Home className="w-3 h-3 text-emerald-600" /> Resident A-204
              </div>
              <div className="text-[10px] text-slate-500">resident@parcelease.in</div>
            </button>

            <button
              onClick={() => handleQuickLogin('SOCIETY_ADMIN')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition-all"
            >
              <div className="font-bold text-navy-950 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-amber-600" /> Society Admin
              </div>
              <div className="text-[10px] text-slate-500">admin@parcelease.in</div>
            </button>

            <button
              onClick={() => handleQuickLogin('PLATFORM_ADMIN')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left transition-all"
            >
              <div className="font-bold text-navy-950 flex items-center gap-1">
                <Globe className="w-3 h-3 text-purple-600" /> Super Admin
              </div>
              <div className="text-[10px] text-slate-500">platform@parcelease.in</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-16 text-xs text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          Loading Sign In...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
