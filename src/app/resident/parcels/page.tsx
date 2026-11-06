'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Package, Search, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDemo } from '@/lib/context/demo-context';
import { MockDatabase } from '@/lib/db/mock-db';
import { formatIST } from '@/lib/scheduling/engine';

export default function ResidentParcelsPage() {
  const { currentUser } = useDemo();
  const [tab, setTab] = useState<'ALL' | 'ACTIVE' | 'COLLECTED'>('ALL');
  const [query, setQuery] = useState('');

  const apartmentNumber = currentUser?.apartment_number || 'A-204';
  const myParcels = MockDatabase.getParcels({
    apartment_number: apartmentNumber,
  });

  const filtered = myParcels.filter((p) => {
    const matchesTab =
      tab === 'ALL' ||
      (tab === 'ACTIVE' && p.status !== 'COLLECTED' && p.status !== 'DELIVERED') ||
      (tab === 'COLLECTED' && (p.status === 'COLLECTED' || p.status === 'DELIVERED'));

    const matchesQuery =
      p.reference_number.toLowerCase().includes(query.toLowerCase()) ||
      p.tracking_number.toLowerCase().includes(query.toLowerCase()) ||
      p.courier_company.toLowerCase().includes(query.toLowerCase());

    return matchesTab && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">My Apartment Parcels</h1>
          <p className="text-xs text-slate-500 mt-1">
            All shipments assigned to Unit {apartmentNumber}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              tab === 'ALL' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-700'
            }`}
          >
            All ({myParcels.length})
          </button>
          <button
            onClick={() => setTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              tab === 'ACTIVE' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setTab('COLLECTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              tab === 'COLLECTED' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-700'
            }`}
          >
            Collected History
          </button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search reference, courier, tracking..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No parcels matching the filter.
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-950 font-mono text-sm">{p.reference_number}</span>
                    <Badge status={p.status} />
                  </div>
                  <div className="text-slate-600 mt-1">
                    {p.courier_company} • AWB: {p.tracking_number} • Storage: <strong className="text-blue-700">{p.storage_location}</strong>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Received: {formatIST(p.received_at)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/resident/parcels/${p.id}`}>
                    <Button size="sm" variant="outline" className="text-xs h-8">
                      View Details &amp; Pass <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
