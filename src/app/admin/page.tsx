'use client';

import React from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  Users,
  Download,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDemo } from '@/lib/context/demo-context';
import { MockDatabase } from '@/lib/db/mock-db';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'];

export default function SocietyAdminDashboard() {
  const { society, currentUser, stateTick } = useDemo();
  const metrics = MockDatabase.getSocietyMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">
            {society.name} — Operational Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Society Code: <strong className="font-mono text-navy-900">{society.code}</strong> • Operating: {society.operating_hours.start} – {society.operating_hours.end} IST
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/reports">
            <Button variant="outline" className="text-xs font-semibold">
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export Reports
            </Button>
          </Link>
          <Link href="/admin/schedules">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
              Configure Schedules &amp; Slots
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Parcels Today</span>
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-navy-950">{metrics.parcelsToday}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              ↑ 18% vs last week
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completion Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-700">
              {metrics.collectionCompletionRate}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Verified OTP handovers
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Storage Duration</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-navy-950">
              {metrics.avgStorageDurationHours} hrs
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              From guard intake to pickup
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Peak Arrival Window</span>
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 text-lg font-bold text-navy-950">
              {metrics.peakHour}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Highest courier congestion
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Volume Trend (Area Chart) */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Daily Parcel Intake &amp; Handover Trend</CardTitle>
                <CardDescription className="text-xs">Incoming packages vs resident handovers</CardDescription>
              </div>
              <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">
                Past 7 Days
              </Badge>
            </CardHeader>

            <CardContent className="p-4 pt-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.dailyTrend}>
                    <defs>
                      <linearGradient id="receivedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                    <Area
                      type="monotone"
                      dataKey="received"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#receivedGrad)"
                      name="Received at Gate"
                    />
                    <Area
                      type="monotone"
                      dataKey="collected"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#collectedGrad)"
                      name="Collected by Resident"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courier Distribution (Pie Chart) */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold">Courier Share</CardTitle>
              <CardDescription className="text-xs">Volume distribution by courier company</CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-6">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.volumeByCourier}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="courier"
                    >
                      {metrics.volumeByCourier.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-slate-600">
                {metrics.volumeByCourier.slice(0, 4).map((c, i) => (
                  <div key={c.courier} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span>{c.courier}: {c.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Peak Arrival Periods Bar Chart */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold">Peak Gate Intake Windows (IST)</CardTitle>
          <CardDescription className="text-xs">
            Assists RWA committee in deploying additional security personnel during peak delivery rushes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-6">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.peakArrivalPeriods}>
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Parcels Arrived" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
