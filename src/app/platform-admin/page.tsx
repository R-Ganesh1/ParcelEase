'use client';

import React from 'react';
import Link from 'next/link';
import {
  Globe,
  Building,
  Users,
  Package,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Plus,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PlatformAdminPage() {
  const societies = [
    {
      id: 'soc-1',
      name: 'Greenwood Heights RWA',
      city: 'Bengaluru, Karnataka',
      apartments: 180,
      parcelsToday: 24,
      status: 'ACTIVE',
      plan: 'Growth Community (₹5,999/mo)',
    },
    {
      id: 'soc-2',
      name: 'Prestige Lakeside Habitat',
      city: 'Bengaluru, Karnataka',
      apartments: 1200,
      parcelsToday: 188,
      status: 'ACTIVE',
      plan: 'Enterprise Township (₹11,999/mo)',
    },
    {
      id: 'soc-3',
      name: 'DLF Cyber City Residency',
      city: 'Gurugram, Haryana',
      apartments: 450,
      parcelsToday: 62,
      status: 'ACTIVE',
      plan: 'Growth Community (₹5,999/mo)',
    },
    {
      id: 'soc-4',
      name: 'Hiranandani Gardens RWA',
      city: 'Powai, Mumbai',
      apartments: 850,
      parcelsToday: 114,
      status: 'ACTIVE',
      plan: 'Enterprise Township (₹11,999/mo)',
    },
    {
      id: 'soc-5',
      name: 'My Home Bhooja',
      city: 'Hitec City, Hyderabad',
      apartments: 600,
      parcelsToday: 0,
      status: 'PENDING_APPROVAL',
      plan: 'Starter Society (₹2,999/mo)',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Platform Super Administration</h1>
          <p className="text-xs text-slate-500 mt-1">
            Global management across all registered Indian gated societies and residential townships
          </p>
        </div>

        <Link href="/platform-admin/societies">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
            <Plus className="w-4 h-4 mr-1.5" /> Onboard New Society
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Registered Societies</span>
              <Building className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-navy-950">38</div>
            <div className="text-[11px] text-slate-400 mt-1">Across 5 Indian metro cities</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Apartments</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-navy-950">14,280</div>
            <div className="text-[11px] text-slate-400 mt-1">Verified resident profiles</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Daily Platform Volume</span>
              <Package className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-navy-950">3,490</div>
            <div className="text-[11px] text-slate-400 mt-1">Parcels processed today</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">MRR Under Management</span>
              <CreditCard className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-navy-950">₹2.84 L</div>
            <div className="text-[11px] text-slate-400 mt-1">Active subscriptions</div>
          </CardContent>
        </Card>
      </div>

      {/* Societies Master Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Managed Apartment Communities</CardTitle>
            <CardDescription className="text-xs">
              Live status, parcel activity, and plan subscriptions
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Society Name</th>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4 font-semibold">Units</th>
                  <th className="py-3 px-4 font-semibold">Today&apos;s Parcels</th>
                  <th className="py-3 px-4 font-semibold">SaaS Tier</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {societies.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-navy-950 text-sm">{s.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{s.city}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{s.apartments}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-700">{s.parcelsToday}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{s.plan}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {s.status}
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
