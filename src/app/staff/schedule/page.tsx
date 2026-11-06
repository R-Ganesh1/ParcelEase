'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, Clock, Truck, ShieldCheck, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MockDatabase } from '@/lib/db/mock-db';

export default function StaffSchedulePage() {
  const parcels = MockDatabase.getParcels();
  const bookedParcels = parcels.filter(
    (p) => p.status === 'BOOKED' || p.status === 'DELIVERY_SCHEDULED'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-950">Daily Collection &amp; Delivery Schedule</h1>
        <p className="text-xs text-slate-500 mt-1">
          Upcoming resident pickup time windows and society internal doorstep deliveries
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Self-Collection Window Queue */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <CardTitle className="text-base font-bold">Gate Desk Self-Collection Pass Queue</CardTitle>
                <CardDescription className="text-xs">Residents arriving with 6-digit OTPs</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {bookedParcels.filter((p) => p.booking?.booking_type === 'COLLECTION').length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No self-collections scheduled yet. Once a resident books a slot, it appears here.
              </div>
            ) : (
              bookedParcels
                .filter((p) => p.booking?.booking_type === 'COLLECTION')
                .map((p) => (
                  <div key={p.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-navy-950">Apt {p.apartment_number} • {p.recipient_name}</div>
                      <div className="text-[11px] text-slate-500">{p.reference_number} ({p.courier_company})</div>
                      <div className="text-[11px] font-semibold text-blue-700 mt-1">
                        Scheduled: {p.booking?.date} ({p.booking?.time_window})
                      </div>
                    </div>
                    <Link href={`/staff/handover?parcelId=${p.id}`}>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-8">
                        Verify Pass
                      </Button>
                    </Link>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        {/* Doorstep Delivery Queue */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              <div>
                <CardTitle className="text-base font-bold">Scheduled Doorstep Delivery Queue</CardTitle>
                <CardDescription className="text-xs">Apartment tower dispatch routing</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {bookedParcels.filter((p) => p.booking?.booking_type === 'DOORSTEP_DELIVERY').length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No doorstep delivery requests active right now.
              </div>
            ) : (
              bookedParcels
                .filter((p) => p.booking?.booking_type === 'DOORSTEP_DELIVERY')
                .map((p) => (
                  <div key={p.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-navy-950">Apt {p.apartment_number} • {p.recipient_name}</div>
                      <div className="text-[11px] text-slate-500">{p.reference_number} ({p.storage_location})</div>
                      <div className="text-[11px] font-semibold text-emerald-700 mt-1">
                        Dispatch Window: {p.booking?.date} ({p.booking?.time_window})
                      </div>
                    </div>
                    <Link href={`/staff/handover?parcelId=${p.id}`}>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8">
                        Complete Doorstep
                      </Button>
                    </Link>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
