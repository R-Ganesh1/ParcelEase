'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Truck,
  QrCode,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Info,
  CalendarCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useDemo } from '@/lib/context/demo-context';
import { MockDatabase } from '@/lib/db/mock-db';
import { formatIST } from '@/lib/scheduling/engine';

export default function ParcelDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const parcelId = params.id as string;

  const { currentUser, society, refreshState } = useDemo();

  const parcel = MockDatabase.getParcelById(parcelId);
  const events = MockDatabase.getParcelEvents(parcelId);

  // Scheduling State
  const todayDateStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const tomorrowDateStr = tomorrowDate.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayDateStr);
  const [selectedSlotWindow, setSelectedSlotWindow] = useState('');
  const [bookingType, setBookingType] = useState<'COLLECTION' | 'DOORSTEP_DELIVERY'>('COLLECTION');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Success Modal
  const [bookedPass, setBookedPass] = useState<{
    otp: string;
    window: string;
    date: string;
  } | null>(null);

  if (!parcel) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-navy-950">Parcel not found</h2>
        <Link href="/resident">
          <Button variant="outline">Back to Resident Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Generate slots for selected date
  const availableSlots = MockDatabase.getSlots(selectedDate);
  const activeOtp = MockDatabase.getActiveOtp(parcel.id);

  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotWindow) {
      setBookingError('Please select a 30-minute time slot');
      return;
    }

    setIsBooking(true);
    setBookingError('');

    try {
      const result = await MockDatabase.bookCollection({
        parcel_id: parcel.id,
        booking_type: bookingType,
        date: selectedDate,
        time_window: selectedSlotWindow,
        resident_id: currentUser?.id || 'user-resident-1',
        resident_name: currentUser?.full_name || 'Ananya Rao',
        notes: specialNotes,
      });

      refreshState();
      setBookedPass({
        otp: result.plainOtp,
        window: selectedSlotWindow,
        date: selectedDate,
      });
    } catch (err: any) {
      setBookingError(err.message || 'Booking failed');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/resident"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
        </Link>
      </div>

      {/* Main Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Shipment Specs & Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Shipment Reference
                  </div>
                  <CardTitle className="text-xl font-bold font-mono text-navy-950 mt-0.5">
                    {parcel.reference_number}
                  </CardTitle>
                </div>
                <Badge status={parcel.status} />
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Courier Company</span>
                  <strong className="text-navy-900 font-semibold text-sm">{parcel.courier_company}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Tracking / AWB</span>
                  <strong className="text-navy-900 font-mono">{parcel.tracking_number}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Apartment Unit</span>
                  <strong className="text-navy-900 font-semibold">{parcel.apartment_number}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Storage Rack</span>
                  <strong className="text-blue-700 font-semibold">{parcel.storage_location}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Intake Guard</span>
                  <strong className="text-slate-800">{parcel.received_by_staff_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Received Time (IST)</span>
                  <strong className="text-slate-800">{formatIST(parcel.received_at)}</strong>
                </div>
              </div>

              {/* QR Code and Collection Pass preview if active */}
              {parcel.qr_code && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Desk Scan Barcode</div>
                    <div className="text-[11px] text-slate-500">Security can scan this for instant lookup</div>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={parcel.qr_code}
                    alt="QR Code"
                    className="w-20 h-20 border border-slate-200 rounded-lg p-1 bg-white"
                  />
                </div>
              )}

              {/* Handover Proof if already collected */}
              {parcel.status === 'COLLECTED' && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4" /> Parcel Handover Verified
                  </div>
                  <div>Collected By: <strong>{parcel.collected_by_name}</strong></div>
                  <div>Handover Staff: <strong>{parcel.handover_staff_name || 'Ramesh Kumar'}</strong></div>
                  <div>Completed Time: <strong>{formatIST(parcel.collected_at)}</strong></div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Immutable Audit Trail Events */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold">Custody History &amp; Audit Trail</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {events.map((evt) => (
                <div key={evt.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">{evt.title}</div>
                    <div className="text-slate-500 text-[11px]">{evt.description}</div>
                    <div className="text-slate-400 text-[10px] mt-0.5">
                      {formatIST(evt.created_at)} • by {evt.actor_name}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Scheduling Engine */}
        <div className="lg:col-span-5 space-y-6">
          {parcel.status === 'STORED' ? (
            <Card className="border-2 border-blue-500/20 shadow-md">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-base font-bold text-navy-950">Schedule Collection</CardTitle>
                    <CardDescription className="text-xs">
                      Operating Hours: {society.operating_hours.start} – {society.operating_hours.end} IST
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5">
                <form onSubmit={handleBookSlot} className="space-y-4">
                  {/* Delivery Mode: Self Collection vs Doorstep */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Fulfillment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBookingType('COLLECTION')}
                        className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                          bookingType === 'COLLECTION'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Self-Pickup Pass
                      </button>

                      <button
                        type="button"
                        onClick={() => setBookingType('DOORSTEP_DELIVERY')}
                        className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                          bookingType === 'DOORSTEP_DELIVERY'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        Doorstep Delivery
                      </button>
                    </div>
                  </div>

                  {/* Date Selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Select Date
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDate(todayDateStr)}
                        className={`p-2 rounded-lg border text-xs font-medium ${
                          selectedDate === todayDateStr
                            ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        Today ({todayDateStr})
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedDate(tomorrowDateStr)}
                        className={`p-2 rounded-lg border text-xs font-medium ${
                          selectedDate === tomorrowDateStr
                            ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        Tomorrow ({tomorrowDateStr})
                      </button>
                    </div>
                  </div>

                  {/* 30-Minute Slots Grid with Capacity Display */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Available 30-Min Windows
                      </label>
                      <span className="text-[10px] text-slate-400">Max 4 pickups / slot</span>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                      {availableSlots.map((slot) => {
                        const windowKey = `${slot.start_time} - ${slot.end_time}`;
                        const isSelected = selectedSlotWindow === windowKey;
                        const isFull = !slot.is_available;

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={isFull}
                            onClick={() => setSelectedSlotWindow(windowKey)}
                            className={`w-full p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm'
                                : isFull
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-white border-slate-200 text-slate-800 hover:border-blue-300'
                            }`}
                          >
                            <span className="font-mono">
                              {slot.start_time} – {slot.end_time} IST
                            </span>

                            <span className="text-[10px] font-medium">
                              {isFull ? (
                                <span className="text-red-500 font-bold">Slot Full</span>
                              ) : (
                                <span>
                                  {slot.capacity - slot.booked_count} spots left
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {bookingError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    isLoading={isBooking}
                    disabled={!selectedSlotWindow}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-10 shadow-md shadow-blue-500/20"
                  >
                    Confirm Booking &amp; Generate OTP Pass
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            /* Active Booking / Pass View */
            <Card className="border-2 border-emerald-500/30">
              <CardHeader className="bg-emerald-50/70 border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-base font-bold text-emerald-950">Active Collection Pass</CardTitle>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4 text-xs">
                {activeOtp && (
                  <div className="text-center p-5 rounded-2xl bg-navy-950 text-white space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                      Single-Use Security OTP
                    </div>
                    <div className="text-4xl font-black font-mono tracking-widest text-emerald-400">
                      {activeOtp}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Show this 6-digit code to security guard Ramesh Kumar at Gate 1
                    </div>
                  </div>
                )}

                {parcel.booking && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Scheduled Date:</span>
                      <strong className="text-navy-950">{parcel.booking.date}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Time Window:</span>
                      <strong className="text-blue-700">{parcel.booking.time_window} IST</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Booking Mode:</span>
                      <strong className="text-navy-950">{parcel.booking.booking_type}</strong>
                    </div>
                  </div>
                )}

                <div className="pt-2 space-y-2">
                  <Link href="/resident/bookings" className="block">
                    <Button
                      className="w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs py-2.5 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <CalendarCheck className="w-4 h-4 text-emerald-400" /> View In Scheduled Bookings
                    </Button>
                  </Link>
                  <Link href="/resident/parcels" className="block">
                    <Button
                      variant="outline"
                      className="w-full text-xs font-semibold text-slate-700"
                    >
                      Back to My Parcels
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {bookedPass && (
        <Modal
          isOpen={Boolean(bookedPass)}
          onClose={() => setBookedPass(null)}
          title="Collection Pass Confirmed!"
          description="Your scheduled pickup window has been reserved"
        >
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="p-4 rounded-xl bg-navy-950 text-white space-y-1">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Your Handover OTP Pass</div>
              <div className="text-3xl font-black font-mono tracking-widest text-emerald-400">
                {bookedPass.otp}
              </div>
              <div className="text-[10px] text-slate-400">
                Window: {bookedPass.date} ({bookedPass.window} IST)
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Please present this 6-digit OTP code to security guard Ramesh Kumar at Gate 1 during your pickup window to securely collect your parcel.
            </p>

            <div className="pt-2 space-y-2">
              <Button
                onClick={() => setBookedPass(null)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 flex items-center justify-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Done, Keep My Pass
              </Button>
              <Link href="/resident/bookings" className="block">
                <Button
                  variant="outline"
                  onClick={() => setBookedPass(null)}
                  className="w-full text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-blue-600" /> View All Scheduled Passes
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
