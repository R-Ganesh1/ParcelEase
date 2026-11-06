'use client';

import React, { useState } from 'react';
import { Clock, ShieldCheck, UserCheck, Package, Filter, CheckCircle2, QrCode } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MockDatabase } from '@/lib/db/mock-db';
import { formatIST } from '@/lib/scheduling/engine';

export default function StaffAuditPage() {
  const [filterType, setFilterType] = useState<'ALL' | 'INTAKE' | 'HANDOVER' | 'BOOKING'>('ALL');
  const parcels = MockDatabase.getParcels();

  // Collect all events from all parcels
  const allEvents = parcels.flatMap((p) =>
    MockDatabase.getParcelEvents(p.id).map((e) => ({
      ...e,
      parcelRef: p.reference_number,
      apt: p.apartment_number,
      courier: p.courier_company,
    }))
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredEvents = allEvents.filter((e) => {
    if (filterType === 'INTAKE') return e.status === 'RECEIVED' || e.status === 'STORED';
    if (filterType === 'HANDOVER') return e.status === 'COLLECTED';
    if (filterType === 'BOOKING') return e.status === 'BOOKED' || e.status === 'DELIVERY_SCHEDULED';
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Staff Custody &amp; Security Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable chronological log of all gate intakes, resident slot bookings, and verified handovers
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Logs ({allEvents.length})
          </button>
          <button
            onClick={() => setFilterType('INTAKE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'INTAKE'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Gate Intake
          </button>
          <button
            onClick={() => setFilterType('BOOKING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'BOOKING'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Pass Bookings
          </button>
          <button
            onClick={() => setFilterType('HANDOVER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === 'HANDOVER'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Handovers
          </button>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-navy-950">Chronological Custody Timeline</CardTitle>
            <CardDescription className="text-xs">
              Tamper-evident logs with exact timestamps and operating officer details
            </CardDescription>
          </div>
          <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px]">
            {filteredEvents.length} Events
          </Badge>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3.5">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No events found matching the selected filter.
              </div>
            ) : (
              filteredEvents.map((evt) => {
                const isHandover = evt.status === 'COLLECTED';
                const isIntake = evt.status === 'RECEIVED' || evt.status === 'STORED';

                return (
                  <div
                    key={evt.id}
                    className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border transition-all ${
                      isHandover
                        ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                        : isIntake
                        ? 'bg-blue-50/40 border-blue-200 hover:border-blue-300'
                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                        isHandover
                          ? 'bg-emerald-100 text-emerald-700'
                          : isIntake
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {isHandover ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isIntake ? (
                        <Package className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm text-navy-950">{evt.title}</span>
                        <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
                          {formatIST(evt.created_at)}
                        </span>
                      </div>

                      <p className="text-slate-600 text-xs mt-1 leading-relaxed">{evt.description}</p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-medium pt-1.5 border-t border-black/5">
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-navy-950 font-bold">
                          Unit: {evt.apt}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-slate-700">
                          {evt.parcelRef}
                        </span>
                        {evt.courier && (
                          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                            {evt.courier}
                          </span>
                        )}
                        <span className="ml-auto text-blue-700 font-semibold">
                          Staff: {evt.actor_name}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
