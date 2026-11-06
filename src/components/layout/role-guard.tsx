'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDemo } from '@/lib/context/demo-context';
import { UserRole } from '@/types';
import { ShieldAlert, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RoleGuardProps {
  requiredRole: UserRole;
  portalName: string;
  children: React.ReactNode;
}

export function RoleGuard({ requiredRole, portalName, children }: RoleGuardProps) {
  const { currentUser } = useDemo();
  const router = useRouter();

  // If user is logged in with the exact required role, allow access
  if (currentUser && currentUser.role === requiredRole) {
    return <>{children}</>;
  }

  const getDashboardUrl = (role: UserRole) => {
    switch (role) {
      case 'RESIDENT':
        return '/resident';
      case 'STAFF':
        return '/staff';
      case 'SOCIETY_ADMIN':
        return '/admin';
      case 'PLATFORM_ADMIN':
        return '/platform-admin';
    }
  };

  const roleLabels: Record<UserRole, string> = {
    RESIDENT: 'Resident',
    STAFF: 'Security Guard / Staff',
    SOCIETY_ADMIN: 'Society Administrator',
    PLATFORM_ADMIN: 'Platform Super Admin',
  };

  // State 1: User is completely logged out
  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-slate-200 shadow-xl bg-white text-center">
          <CardHeader className="space-y-3 pb-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <CardTitle className="text-xl font-bold text-navy-950">
              Authentication Required
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Please sign in with authorized credentials to access the{' '}
              <strong className="text-navy-950">{portalName}</strong>.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 pt-4">
            <Button
              onClick={() => router.push(`/login?role=${requiredRole}&reason=login_required`)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 flex items-center justify-center gap-2 shadow-sm"
            >
              Sign In to {portalName} <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/register?role=${requiredRole}`)}
              className="w-full text-xs font-semibold text-slate-700"
            >
              Register for {portalName}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // State 2: User is logged in, but with a DIFFERENT role (e.g. Staff trying to access Admin)
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-amber-200 shadow-xl bg-white text-center">
        <CardHeader className="space-y-3 pb-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner border border-amber-100">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <CardTitle className="text-xl font-bold text-navy-950">
            Access Restricted: Role Mismatch
          </CardTitle>
          <CardDescription className="text-xs text-slate-600 space-y-1">
            <p>
              You are currently authenticated as{' '}
              <strong className="text-navy-950 font-bold">{currentUser.full_name}</strong>{' '}
              <span className="text-blue-700 font-semibold">({roleLabels[currentUser.role]})</span>.
            </p>
            <p className="text-slate-500">
              The <strong>{portalName}</strong> requires an authorized{' '}
              <span className="font-semibold text-amber-800">{roleLabels[requiredRole]}</span>{' '}
              account. Please log in with matching credentials to proceed.
            </p>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pt-4">
          <Button
            onClick={() => router.push(`/login?role=${requiredRole}&reason=switch_required`)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 flex items-center justify-center gap-2 shadow-sm"
          >
            Log In as {roleLabels[requiredRole]} <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push(getDashboardUrl(currentUser.role))}
            className="w-full text-xs font-semibold text-slate-700 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to My Portal ({roleLabels[currentUser.role]})
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
