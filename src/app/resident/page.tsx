'use client';

import React from 'react';
import Link from 'next/link';
import {
  Package,
  CalendarCheck,
  Truck,
  Bell,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDemo } from '@/lib/context/demo-context';
import { MockDatabase } from '@/lib/db/mock-db';
import { formatIST } from '@/lib/scheduling/engine';

export default function ResidentDashboard() {
  const { currentUser, society, stateTick } = useDemo();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-navy-950">Sign In to View Resident Portal</h2>
        <p className="text-xs text-slate-500">
          Please sign in with your apartment credentials to view your active parcels and book collection slots.
        </p>
        <Link href="/login?role=RESIDENT">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-6 py-2.5">
            Sign In as Resident
          </Button>
        </Link>
      </div>
    );
  }

  // Filter parcels belonging to the resident's apartment
  const myParcels = MockDatabase.getParcels({
    apartment_number: currentUser.apartment_number || 'A-204',
  });

  const activeParcels = myParcels.filter(
    (p) => p.status !== 'COLLECTED' && p.status !== 'DELIVERED'
  );
  const collectedParcels = myParcels.filter(
    (p) => p.status === 'COLLECTED' || p.status === 'DELIVERED'
  );
  const todayBookings = myParcels.filter((p) => p.status === 'BOOKED');
  const doorstepDeliveries = myParcels.filter((p) => p.status === 'DELIVERY_SCHEDULED');

  const notifications = MockDatabase.getNotifications(currentUser.id).slice(0, 4);

  return (
    <div className="space-y-6">

      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">
            Welcome home, {currentUser.full_name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Apartment Unit: <strong className="text-navy-900">{currentUser.apartment_number}</strong> • Society: {society.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/resident/parcels">
            <Button variant="outline" className="text-xs font-semibold">
              <Package className="w-4 h-4 mr-1.5" /> All Parcels ({myParcels.length})
            </Button>
          </Link>
          <Link href="/resident/support">
            <Button variant="ghost" className="text-xs text-slate-600">
              Need Help?
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Awaiting Collection</span>
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-navy-950">{activeParcels.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Safe in Guard Desk</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Today&apos;s Bookings</span>
              <CalendarCheck className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-navy-950">{todayBookings.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Self-pickup pass active</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Doorstep Deliveries</span>
              <Truck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-navy-950">{doorstepDeliveries.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Direct to Unit {currentUser.apartment_number}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Collected History</span>
              <CheckCircle2 className="w-4 h-4 text-slate-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-navy-950">{collectedParcels.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Total verified deliveries</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Parcels Requiring Resident Action */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Active Parcels at Gate Desk</CardTitle>
            <CardDescription className="text-xs">
              Select an available collection time window or request doorstep delivery
            </CardDescription>
          </div>
          <Badge className="bg-blue-50 text-blue-800 border-blue-200">
            {activeParcels.length} Active
          </Badge>
        </CardHeader>

        <CardContent className="p-4">
          {activeParcels.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p>No parcels currently stored for your apartment.</p>
              <p className="text-[11px] text-slate-400">
                Incoming deliveries received at the gate terminal will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeParcels.map((p) => {
                const activeOtp = MockDatabase.getActiveOtp(p.id);

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-navy-950 font-mono">
                          {p.reference_number}
                        </span>
                        <Badge status={p.status} />
                      </div>
                      <div className="text-xs text-slate-600">
                        {p.courier_company} • AWB: {p.tracking_number} • Bay:{' '}
                        <strong className="text-blue-700">{p.storage_location}</strong>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Received: {formatIST(p.received_at)} by {p.received_by_staff_name}
                      </div>

                      {/* If booked, display the time window & OTP badge */}
                      {p.booking && (
                        <div className="pt-2 flex items-center gap-3">
                          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Booked: {p.booking.date} ({p.booking.time_window})
                          </span>

                          {activeOtp && (
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-mono tracking-wider">
                              OTP: {activeOtp}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/resident/parcels/${p.id}`}>
                        <Button
                          size="sm"
                          className={
                            p.status === 'STORED'
                              ? 'bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-9 px-4'
                              : 'bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs h-9 px-4'
                          }
                        >
                          {p.status === 'STORED' ? 'Schedule Pickup / Delivery' : 'View Pass & QR'}
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Grid: Recent In-App Notifications & Completed Handovers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-sm font-bold">Recent In-App Notifications</CardTitle>
            </div>
            <span className="text-[11px] text-slate-400">Real-time alerts</span>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No notifications yet.</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                  <div className="font-semibold text-slate-900 flex justify-between">
                    <span>{n.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{formatIST(n.created_at)}</span>
                  </div>
                  <p className="mt-1 text-slate-600 leading-snug">{n.message}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recently Collected History */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-sm font-bold">Completed Handover Proofs</CardTitle>
            </div>
            <span className="text-[11px] text-slate-400">Immutable audit</span>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {collectedParcels.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No handovers completed yet.
              </div>
            ) : (
              collectedParcels.slice(0, 3).map((p) => (
                <div key={p.id} className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/40 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-navy-950">
                    <span>{p.reference_number}</span>
                    <Badge status="COLLECTED" />
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Collected by <strong>{p.collected_by_name}</strong> • Staff: {p.handover_staff_name || 'Ramesh Kumar'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Verified at: {formatIST(p.collected_at)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
