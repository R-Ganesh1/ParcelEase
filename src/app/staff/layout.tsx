'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { RoleGuard } from '@/components/layout/role-guard';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard requiredRole="STAFF" portalName="Security Staff Gate Terminal">
      <div className="flex-1 flex flex-col md:flex-row bg-slate-100/70">
        <Sidebar />
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</div>
      </div>
    </RoleGuard>
  );
}
