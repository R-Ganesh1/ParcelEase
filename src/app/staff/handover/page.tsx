'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDemo } from '@/lib/context/demo-context';
import { MockDatabase } from '@/lib/db/mock-db';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  ShieldCheck,
  PackageCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  UserCheck,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { formatIST } from '@/lib/scheduling/engine';

export const dynamic = 'force-dynamic';

function HandoverTerminalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialParcelId = searchParams ? searchParams.get('parcelId') || '' : '';

  const { currentUser, society, refreshState } = useDemo();

  const [selectedParcelId, setSelectedParcelId] = useState(initialParcelId);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('Collected in person with valid OTP verification.');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [handoverSuccess, setHandoverSuccess] = useState<any>(null);

  const activeParcels = MockDatabase.getParcels().filter(
    (p) => p.status !== 'COLLECTED' && p.status !== 'DELIVERED'
  );

  const selectedParcel = MockDatabase.getParcelById(selectedParcelId);

  // If a parcel is selected, auto-populate expected recipient
  useEffect(() => {
    if (selectedParcel) {
      setRecipientName(selectedParcel.recipient_name);
      setErrorMsg('');
    }
  }, [selectedParcelId, selectedParcel]);

  const handleVerifyHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcelId) {
      setErrorMsg('Please select a parcel awaiting collection');
      return;
    }

    if (!enteredOtp || enteredOtp.length < 6) {
      setErrorMsg('Please enter the complete 6-digit OTP pass');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const result = await MockDatabase.verifyHandover({
        parcel_id: selectedParcelId,
        entered_otp: enteredOtp,
        staff_id: currentUser?.id || 'user-staff-1',
        staff_name: currentUser?.full_name || 'Ramesh Kumar (Gate 1)',
        recipient_name: recipientName || 'Resident',
        notes: handoverNotes,
      });

      if (!result.success) {
        setErrorMsg(result.message);
      } else {
        refreshState();
        setHandoverSuccess(result.parcel);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetForNextHandover = () => {
    setHandoverSuccess(null);
    setSelectedParcelId('');
    setEnteredOtp('');
    setRecipientName('');
    setHandoverNotes('');
    setErrorMsg('');
  };

  // Helper to show the actual active OTP for convenience in demo mode
  const activeOtpInDemo = selectedParcel ? MockDatabase.getActiveOtp(selectedParcel.id) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Secure Parcel Handover Terminal</CardTitle>
              <CardDescription className="text-xs">
                Validate resident OTP pass before releasing parcels from {society.name} guard desk
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerifyHandover} className="space-y-5">
            {/* Parcel Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Select Parcel Awaiting Handover *
              </label>
              <select
                value={selectedParcelId}
                onChange={(e) => setSelectedParcelId(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-xs font-bold text-navy-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              >
                <option value="">-- Choose parcel by apartment or reference --</option>
                {activeParcels.map((p) => (
                  <option key={p.id} value={p.id}>
                    Apt {p.apartment_number} | {p.reference_number} ({p.courier_company}) - {p.recipient_name} [{p.status}]
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Parcel Card Details */}
            {selectedParcel && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="font-bold text-navy-950 text-sm">
                    Apartment {selectedParcel.apartment_number} • {selectedParcel.recipient_name}
                  </div>
                  <Badge status={selectedParcel.status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Reference:</span>
                    <strong className="text-navy-900 font-mono">{selectedParcel.reference_number}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Courier:</span>
                    <strong className="text-navy-900">{selectedParcel.courier_company}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Storage Bay:</span>
                    <strong className="text-blue-700">{selectedParcel.storage_location}</strong>
                  </div>
                </div>

                {/* Demo Helper Pill */}
                {activeOtpInDemo ? (
                  <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                    <span className="text-[11px]">
                      Resident pass active. Expected OTP:{' '}
                      <strong className="font-mono text-sm tracking-wider">{activeOtpInDemo}</strong>
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setEnteredOtp(activeOtpInDemo)}
                      className="text-[10px] h-6 py-0 px-2 bg-white text-emerald-800 border-emerald-300"
                    >
                      Auto-Fill OTP
                    </Button>
                  </div>
                ) : (
                  <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                    No booking or OTP generated yet for this parcel. Resident must first book a slot from their portal.
                  </div>
                )}
              </div>
            )}

            {/* OTP Pass Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Resident 6-Digit Collection OTP *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP code"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full h-11 pl-10 pr-3 rounded-lg border border-slate-300 bg-white font-mono text-lg font-bold tracking-widest text-navy-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Single-use code. 3 incorrect attempts will automatically lock this pass.
              </span>
            </div>

            {/* Recipient Confirmation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Verified Recipient Name *"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Name of person picking up"
                required
              />

              <Input
                label="Staff Handover Notes"
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                placeholder="Optional comments or ID check"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                isLoading={isVerifying}
                disabled={!selectedParcelId || enteredOtp.length < 6}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm h-11 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <PackageCheck className="w-5 h-5" /> Verify OTP &amp; Complete Handover
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Handover Success Modal */}
      {handoverSuccess && (
        <Modal
          isOpen={Boolean(handoverSuccess)}
          onClose={() => setHandoverSuccess(null)}
          title="Handover Verified & Completed!"
          description="Parcel successfully released and custody logged"
        >
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Parcel:</span>
                <span className="font-bold text-navy-950">{handoverSuccess.reference_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Apartment:</span>
                <span className="font-bold text-navy-950">{handoverSuccess.apartment_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Handed Over To:</span>
                <span className="font-bold text-emerald-800">{handoverSuccess.collected_by_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verified Timestamp:</span>
                <span className="font-semibold text-slate-900">{formatIST(handoverSuccess.collected_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Staff Officer:</span>
                <span className="font-semibold text-blue-700">{currentUser?.full_name || 'Ramesh Kumar (Gate 1)'}</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                onClick={handleResetForNextHandover}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 flex items-center justify-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Verify Next Parcel Handover
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setHandoverSuccess(null);
                  router.push('/staff/audit');
                }}
                className="w-full text-xs text-slate-800 font-semibold flex items-center justify-center gap-2"
              >
                View Handover in Custody Log <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setHandoverSuccess(null);
                  router.push('/staff');
                }}
                className="w-full text-xs text-slate-500 hover:text-navy-950"
              >
                Return to Guard Desk Hub
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function StaffHandoverPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12 text-xs text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-600" />
          Loading Handover Terminal...
        </div>
      }
    >
      <HandoverTerminalContent />
    </Suspense>
  );
}
