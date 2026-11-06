import React from 'react';
import Link from 'next/link';
import { Building2, ShieldCheck, TrendingUp, Users, CheckCircle, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ForSocietiesPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Built for Indian RWAs</span>
        <h1 className="text-4xl font-extrabold text-navy-950 tracking-tight">
          Eliminate gate chaos for your apartment association
        </h1>
        <p className="text-slate-600 text-sm">
          Gated communities in Bengaluru, Mumbai, Gurgaon, and Hyderabad receive 200–800 parcels daily. ParcelEase gives management committees complete visibility and control.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-6 space-y-3">
          <ShieldCheck className="w-10 h-10 text-blue-600" />
          <h3 className="font-bold text-lg text-navy-950">Zero Association Liability</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eliminates lost package claims and resident arguments. Every parcel received has a verifiable custody chain from courier delivery to resident OTP verification.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <TrendingUp className="w-10 h-10 text-emerald-600" />
          <h3 className="font-bold text-lg text-navy-950">Peak Hour De-Congestion</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Evenings between 7 PM and 9 PM traditionally see massive queues at guard desks. Our slot engine caps simultaneous pickups to 4 residents per 30 minutes.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <Building2 className="w-10 h-10 text-purple-600" />
          <h3 className="font-bold text-lg text-navy-950">Configurable Operating Rules</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Define society-specific hours (e.g., 08:00 AM – 09:30 PM), automatic overdue flags after 7 days, and doorstep delivery options for senior residents.
          </p>
        </Card>
      </div>

      <div className="p-8 sm:p-12 rounded-2xl bg-slate-100 border border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-950">Ready to pilot in your society?</h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              We offer 30-day risk-free pilot deployments for apartment societies with 50 to 2,000+ units. Onsite guard training and QR barcode labels included.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="/login?role=SOCIETY_ADMIN">
                <Button className="bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs sm:text-sm">
                  Society Admin Portal
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="text-slate-800 text-xs sm:text-sm">
                  View Pricing Tiers
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Society Pilot Checklist</div>
            <div className="space-y-2 text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Upload resident apartment directory via CSV or Excel</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Assign designated shelf racks / bays at security gates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>15-minute training for guard desk staff (tablets or mobile)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Resident notification rollout via society WhatsApp / notice board</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
