'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Package, Search, Filter, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MockDatabase } from '@/lib/db/mock-db';
import { formatIST } from '@/lib/scheduling/engine';

export default function StaffParcelsPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const parcels = MockDatabase.getParcels();

  const filtered = parcels.filter((p) => {
    const matchesSearch =
      p.apartment_number.toLowerCase().includes(search.toLowerCase()) ||
      p.reference_number.toLowerCase().includes(search.toLowerCase()) ||
      p.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
      p.courier_company.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Parcel Inventory &amp; Archive</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete gate custody ledger of all received, booked, and collected shipments
          </p>
        </div>

        <Link href="/staff/register">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
            + Register New Intake
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search apartment, courier, ref code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
              >
                <option value="ALL">All Records</option>
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
                  <th className="py-3 px-4 font-semibold">Apt Unit</th>
                  <th className="py-3 px-4 font-semibold">Parcel Ref</th>
                  <th className="py-3 px-4 font-semibold">Courier &amp; Tracking</th>
                  <th className="py-3 px-4 font-semibold">Recipient</th>
                  <th className="py-3 px-4 font-semibold">Storage Rack</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Received Timestamp</th>
                  <th className="py-3 px-4 font-semibold text-right">Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-navy-950">{p.apartment_number}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">{p.reference_number}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-900">{p.courier_company}</span>
                      <div className="text-[10px] text-slate-400">{p.tracking_number}</div>
                    </td>
                    <td className="py-3 px-4">{p.recipient_name}</td>
                    <td className="py-3 px-4 font-semibold text-blue-700">{p.storage_location}</td>
                    <td className="py-3 px-4"><Badge status={p.status} /></td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{formatIST(p.received_at)}</td>
                    <td className="py-3 px-4 text-right">
                      {p.status !== 'COLLECTED' ? (
                        <Link href={`/staff/handover?parcelId=${p.id}`}>
                          <Button size="sm" variant="outline" className="text-xs h-7 py-0 px-2 text-blue-700 border-blue-200">
                            Verify OTP
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium">Verified Handover</span>
                      )}
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
