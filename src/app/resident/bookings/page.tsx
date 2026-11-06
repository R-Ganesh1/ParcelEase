'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarCheck, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDemo } from '@/lib/context/demo-context';
import { MockDatabase } from '@/lib/db/mock-db';

export default function ResidentBookingsPage() {
  const { currentUser } = useDemo();

  const apartmentNumber = currentUser?.apartment_number || 'A-204';
  const myParcels = MockDatabase.getParcels({
    apartment_number: apartmentNumber,
  });

  const booked = myParcels.filter((p) => p.booking);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-950">Scheduled Pickups &amp; Deliveries</h1>
        <p className="text-xs text-slate-500 mt-1">
          Active time windows and single-use security OTP passes for Apartment {apartmentNumber}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold">Upcoming Reservation Passes</CardTitle>
          <CardDescription className="text-xs">
            Present your OTP at the gate desk to complete authorized pickup
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {booked.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No scheduled collection passes found. Click on any stored parcel to book an available time window.
            </div>
          ) : (
            booked.map((p) => {
              const activeOtp = MockDatabase.getActiveOtp(p.id);

              return (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy-950 font-mono">{p.reference_number}</span>
                      <Badge status={p.status} />
                    </div>
                    <div className="text-slate-600">
                      {p.courier_company} • AWB: {p.tracking_number} • Storage: <strong>{p.storage_location}</strong>
                    </div>
                    <div className="text-blue-700 font-semibold flex items-center gap-1 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      Slot: {p.booking?.date} ({p.booking?.time_window} IST)
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {activeOtp && (
                      <div className="text-center p-2 rounded-lg bg-emerald-100 border border-emerald-300">
                        <span className="text-[10px] text-emerald-800 font-semibold block uppercase">Pass OTP</span>
                        <span className="font-mono font-black text-sm text-emerald-950">{activeOtp}</span>
                      </div>
                    )}

                    <Link href={`/resident/parcels/${p.id}`}>
                      <Button size="sm" variant="outline" className="text-xs h-8">
                        View Pass <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
