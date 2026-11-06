'use client';

import React, { useState } from 'react';
import { Package, Search, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MockDatabase } from '@/lib/db/mock-db';
import { formatIST } from '@/lib/scheduling/engine';

export default function AdminParcelsPage() {
  const [filter, setFilter] = useState('ALL');
  const parcels = MockDatabase.getParcels();

  const filtered = parcels.filter((p) => {
    if (filter === 'OVERDUE') return p.is_overdue || p.status === 'UNCLAIMED';
    if (filter === 'DISPUTED') return p.is_disputed || p.status === 'DISPUTED';
    if (filter === 'STORED') return p.status === 'STORED';
    if (filter === 'COLLECTED') return p.status === 'COLLECTED';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Master Society Parcel Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete audit record across all towers, storage bays, and resident handovers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-700'
            }`}
          >
            All Parcels ({parcels.length})
          </button>
          <button
            onClick={() => setFilter('OVERDUE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filter === 'OVERDUE' ? 'bg-amber-600 text-white' : 'bg-white border text-slate-700'
            }`}
          >
            Overdue (&gt; 7 Days)
          </button>
          <button
            onClick={() => setFilter('COLLECTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filter === 'COLLECTED' ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-700'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Unit</th>
                  <th className="py-3 px-4 font-semibold">Parcel Ref</th>
                  <th className="py-3 px-4 font-semibold">Courier</th>
                  <th className="py-3 px-4 font-semibold">Recipient</th>
                  <th className="py-3 px-4 font-semibold">Storage Bay</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Received</th>
                  <th className="py-3 px-4 font-semibold">Handover / Resolved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-navy-950">{p.apartment_number}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{p.reference_number}</td>
                    <td className="py-3.5 px-4">{p.courier_company}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{p.recipient_name}</td>
                    <td className="py-3.5 px-4 font-semibold text-blue-700">{p.storage_location}</td>
                    <td className="py-3.5 px-4"><Badge status={p.status} /></td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">{formatIST(p.received_at)}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {p.collected_at ? (
                        <span className="text-emerald-700 font-medium">
                          {formatIST(p.collected_at)} to {p.collected_by_name}
                        </span>
                      ) : (
                        <span className="text-slate-400">In Custody</span>
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
