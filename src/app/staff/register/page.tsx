'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemo } from '@/lib/context/demo-context';
import { MockDatabase } from '@/lib/db/mock-db';
import { CourierCompany } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  PackagePlus,
  QrCode,
  CheckCircle2,
  Camera,
  ArrowRight,
  ShieldCheck,
  Building,
  Sparkles,
} from 'lucide-react';

const COURIER_OPTIONS: CourierCompany[] = [
  'Amazon',
  'Flipkart',
  'Blue Dart',
  'Delhivery',
  'DTDC',
  'Shadowfax',
  'India Post',
  'Blinkit',
  'Zepto',
  'Swiggy Instamart',
  'Other',
];

export default function RegisterParcelPage() {
  const router = useRouter();
  const { currentUser, society, refreshState } = useDemo();

  const [apartmentNumber, setApartmentNumber] = useState('A-204'); // Pre-fill hero apartment
  const [recipientName, setRecipientName] = useState('Ananya Rao');
  const [courier, setCourier] = useState<CourierCompany>('Amazon');
  const [trackingNumber, setTrackingNumber] = useState('AMZ-IN-89210492');
  const [parcelCount, setParcelCount] = useState(1);
  const [storageLocation, setStorageLocation] = useState('Bay 2 / Shelf C');
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Modal State
  const [successData, setSuccessData] = useState<{
    referenceNumber: string;
    qrCode: string;
    apartmentNumber: string;
  } | null>(null);

  const apartments = MockDatabase.getApartments();

  // Handle apartment change to automatically fill resident name if known
  const handleApartmentChange = (aptNum: string) => {
    setApartmentNumber(aptNum);
    const apt = apartments.find((a) => a.apartment_number === aptNum);
    if (apt && apt.resident_names.length > 0) {
      setRecipientName(apt.resident_names[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newParcel = await MockDatabase.registerParcel({
        apartment_number: apartmentNumber,
        recipient_name: recipientName,
        courier_company: courier,
        tracking_number: trackingNumber || `AWB-${Math.floor(100000 + Math.random() * 900000)}`,
        parcel_count: Number(parcelCount),
        storage_location: storageLocation,
        photo_url: photoCaptured ? '/parcel-photo-mock.jpg' : undefined,
        staff_id: currentUser?.id || 'user-staff-1',
        staff_name: currentUser?.full_name || 'Ramesh Kumar (Gate 1)',
      });

      refreshState();

      setSuccessData({
        referenceNumber: newParcel.reference_number,
        qrCode: newParcel.qr_code || '',
        apartmentNumber: newParcel.apartment_number,
      });
    } catch (err: any) {
      alert(`Error registering parcel: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSuccessData(null);
    setApartmentNumber('A-204');
    setRecipientName('Ananya Rao');
    setCourier('Amazon');
    setTrackingNumber('');
    setParcelCount(1);
    setStorageLocation('Bay 1 / Shelf A');
    setPhotoCaptured(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">New Parcel Intake Terminal</CardTitle>
              <CardDescription className="text-xs">
                Log courier deliveries entering {society.name} gate desk
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Courier & Tracking */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Courier Company *
                </label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value as CourierCompany)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {COURIER_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Tracking Number / AWB Barcode *"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Scan or enter AWB number"
                required
              />
            </div>

            {/* Destination Apartment & Recipient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Apartment Number *
                </label>
                <select
                  value={apartmentNumber}
                  onChange={(e) => handleApartmentChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {apartments.map((a) => (
                    <option key={a.id} value={a.apartment_number}>
                      {a.apartment_number} (Block {a.block}) - {a.resident_names.join(', ')}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Select A-204 for the golden test journey
                </span>
              </div>

              <Input
                label="Recipient Full Name *"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Recipient name on label"
                required
              />
            </div>

            {/* Storage Bay & Package Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Storage Location Bay *
                </label>
                <select
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="Bay 1 / Main Rack">Bay 1 / Main Rack</option>
                  <option value="Bay 2 / Shelf C">Bay 2 / Shelf C (Recommended)</option>
                  <option value="Bay 3 / Oversized Bay">Bay 3 / Oversized Bay</option>
                  <option value="Cold Storage / Perishable">Cold Storage / Perishable Box</option>
                </select>
              </div>

              <Input
                label="Parcel Count *"
                type="number"
                min={1}
                max={10}
                value={parcelCount}
                onChange={(e) => setParcelCount(Number(e.target.value))}
                required
              />
            </div>

            {/* Optional Photo Capture Simulation */}
            <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${photoCaptured ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {photoCaptured ? 'Package Photograph Attached' : 'Capture Package Photo (Optional)'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Helps residents quickly identify oversized boxes or damaged labels
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPhotoCaptured(!photoCaptured)}
                className="text-xs"
              >
                {photoCaptured ? 'Remove Photo' : 'Simulate Camera Snap'}
              </Button>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/staff')}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20"
              >
                <PackagePlus className="w-4 h-4 mr-1.5" /> Confirm Intake & Notify Resident
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Modal & Next Step Bridge */}
      {successData && (
        <Modal
          isOpen={Boolean(successData)}
          onClose={() => setSuccessData(null)}
          title="Parcel Registered Successfully!"
          description="In-app notification has been dispatched to resident"
        >
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Reference:</span>
                <span className="font-bold text-navy-950 font-mono">{successData.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Apartment:</span>
                <span className="font-bold text-navy-950">{successData.apartmentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Initial Status:</span>
                <span className="font-semibold text-blue-600">STORED (Awaiting Resident Booking)</span>
              </div>
            </div>

            {successData.qrCode && (
              <div className="py-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Generated Desk QR Barcode
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={successData.qrCode}
                  alt="Parcel QR Code"
                  className="w-32 h-32 mx-auto border border-slate-200 rounded-lg p-1 shadow-sm"
                />
              </div>
            )}

            <div className="pt-2 space-y-2">
              <Button
                onClick={handleResetForm}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 flex items-center justify-center gap-2 shadow-sm"
              >
                <PackagePlus className="w-4 h-4" /> Register Another Parcel
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccessData(null);
                  router.push('/staff/parcels');
                }}
                className="w-full text-xs font-semibold text-slate-800 flex items-center justify-center gap-2"
              >
                View Stored Inventory <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSuccessData(null);
                  router.push('/staff');
                }}
                className="w-full text-xs text-slate-500 hover:text-navy-950"
              >
                Back to Staff Desk Hub
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
