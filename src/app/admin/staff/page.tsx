'use client';

import React from 'react';
import { Users, ShieldCheck, Plus, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDemo } from '@/lib/context/demo-context';

export default function AdminStaffPage() {
  const { society } = useDemo();

  const staffMembers = [
    {
      id: 'staff-1',
      name: 'Ramesh Kumar',
      email: 'staff@parcelease.in',
      phone: '+91 98450 67890',
      role: 'Day Shift Lead Security',
      gate: 'Main Gate 1',
      shift: '08:00 - 20:00 IST',
      status: 'ACTIVE',
      parcelsProcessed: 142,
    },
    {
      id: 'staff-2',
      name: 'Suresh Patel',
      email: 'suresh.guard@greenwood.in',
      phone: '+91 98450 11223',
      role: 'Night Shift Gate Guard',
      gate: 'Back Gate 2',
      shift: '20:00 - 08:00 IST',
      status: 'ACTIVE',
      parcelsProcessed: 48,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Security Guard &amp; Staff Accounts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorized personnel permitted to register intake packages and verify OTP handovers at {society.name}
          </p>
        </div>

        <Button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
          <Plus className="w-4 h-4 mr-1.5" /> Authorize New Staff Account
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold">Active Security Guard Roster</CardTitle>
          <CardDescription className="text-xs">
            Role-Based Access Control enforced at database level
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Staff Name</th>
                  <th className="py-3 px-4 font-semibold">Assigned Post</th>
                  <th className="py-3 px-4 font-semibold">Shift Hours</th>
                  <th className="py-3 px-4 font-semibold">Contact Phone</th>
                  <th className="py-3 px-4 font-semibold">Parcels Handled</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffMembers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-navy-950 text-sm">{s.name}</div>
                      <div className="text-[10px] text-slate-400">{s.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{s.gate}</td>
                    <td className="py-3.5 px-4 text-slate-600">{s.shift}</td>
                    <td className="py-3.5 px-4 font-mono">{s.phone}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-700">{s.parcelsProcessed}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" /> Active Duty
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
