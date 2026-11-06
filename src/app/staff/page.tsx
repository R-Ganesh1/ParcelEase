'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PackagePlus,
  Package,
  CalendarCheck,
  AlertTriangle,
  Search,
  ShieldCheck,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useDemo } from '@/lib/context/demo-context';
import { MockDatabase } from '@/lib/db/mock-db';
import { formatIST } from '@/lib/scheduling/engine';

export default function StaffDashboard() {
  const { society, currentUser, refreshState, stateTick } = useDemo();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const parcels = MockDatabase.getParcels();
  const todayStr = new Date().toISOString().split('T')[0];

  const parcelsReceivedToday = parcels.filter((p) => p.received_at.startsWith(todayStr)).length;
  const parcelsInStorage = parcels.filter((p) =>
    ['RECEIVED', 'STORED', 'BOOKED', 'READY_FOR_HANDOVER'].includes(p.status)
  ).length;
  const expectedCollections = parcels.filter(
    (p) => p.status === 'BOOKED' || p.status === 'DELIVERY_SCHEDULED'
  ).length;
  const overdueParcels = parcels.filter((p) => p.is_overdue || p.status === 'UNCLAIMED').length;

  const filteredParcels = parcels.filter((p) => {
    const matchesSearch =
      p.apartment_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.courier_company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-950">Security Guard Desk</h1>
            <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">
              Gate 1 Desk Active
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Society: <strong>{society.name}</strong> • Operating Hours: {society.operating_hours.start} – {society.operating_hours.end} IST
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/staff/handover">
            <Button variant="outline" className="border-slate-300 hover:bg-slate-50 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-600" /> Verify Handover (OTP)
            </Button>
          </Link>
          <Link href="/staff/register">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20">
              <PackagePlus className="w-4 h-4 mr-1.5" /> Register Incoming Parcel
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Received Today</span>
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-navy-950">{parcelsReceivedToday}</div>
            <div className="text-[11px] text-slate-400 mt-1">Logged by Gate 1 staff</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Storage</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-navy-950">{parcelsInStorage}</div>
            <div className="text-[11px] text-slate-400 mt-1">Awaiting pickup / delivery</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Scheduled Today</span>
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-navy-950">{expectedCollections}</div>
            <div className="text-[11px] text-slate-400 mt-1">Confirmed pickup windows</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overdue (&gt; 7 Days)</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-navy-950">{overdueParcels}</div>
            <div className="text-[11px] text-slate-400 mt-1">RWA escalation required</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Parcel Ledger & Quick Handovers */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold">Active Parcels Inventory</CardTitle>
              <CardDescription className="text-xs">
                Search by apartment, reference code, recipient name, or courier
              </CardDescription>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                <input
                  type="text"
                  placeholder="Filter A-204, Amazon, PE-..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="STORED">In Storage</option>
                <option value="BOOKED">Pickup Booked</option>
                <option value="COLLECTED">Collected</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Apartment</th>
                  <th className="py-3 px-4 font-semibold">Reference & Courier</th>
                  <th className="py-3 px-4 font-semibold">Recipient</th>
                  <th className="py-3 px-4 font-semibold">Storage Bay</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Scheduled Window</th>
                  <th className="py-3 px-4 font-semibold text-right">Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParcels.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No parcels matching the criteria. Click &quot;Register Incoming Parcel&quot; to log one.
                    </td>
                  </tr>
                ) : (
                  filteredParcels.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-navy-950 text-sm">
                        {p.apartment_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{p.reference_number}</div>
                        <div className="text-[11px] text-slate-400">
                          {p.courier_company} • {p.tracking_number}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {p.recipient_name}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-blue-700">
                        {p.storage_location}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={p.status} />
                      </td>
                      <td className="py-3.5 px-4">
                        {p.booking ? (
                          <div className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {p.booking.date} ({p.booking.time_window})
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Unscheduled</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {p.status !== 'COLLECTED' && p.status !== 'DELIVERED' ? (
                          <Link href={`/staff/handover?parcelId=${p.id}`}>
                            <Button size="sm" variant="outline" className="text-blue-700 border-blue-200 hover:bg-blue-50 text-xs py-1 h-7">
                              Verify Handover
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-medium flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Handed Over
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
