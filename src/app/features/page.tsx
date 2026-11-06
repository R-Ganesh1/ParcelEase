import React from 'react';
import Link from 'next/link';
import {
  PackagePlus,
  ShieldAlert,
  Calendar,
  Lock,
  Smartphone,
  BarChart,
  BellRing,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FeaturesPage() {
  const featureList = [
    {
      icon: PackagePlus,
      title: 'Ultra-Fast Security Intake',
      description: 'Guards register incoming packages in under 30 seconds with autocomplete apartment lookup, courier tags, storage bay assignments, and optional package photos.',
    },
    {
      icon: Calendar,
      title: 'Intelligent Scheduling Engine',
      description: 'Residents reserve verified 30-minute collection slots or request doorstep delivery within society operating hours. Slot capacity limits prevent gate queues.',
    },
    {
      icon: Lock,
      title: 'Single-Use Cryptographic OTP',
      description: 'Handovers are verified with 6-digit cryptographic OTPs with 15-minute expiry and 3-attempt brute-force protection. OTPs are never stored in plaintext.',
    },
    {
      icon: BellRing,
      title: 'Real-Time In-App Alerts',
      description: 'Instant notification on delivery arrival, booking confirmations, 1-hour collection reminders, and overdue alerts for packages unclaimed after 7 days.',
    },
    {
      icon: BarChart,
      title: 'RWA & Society Analytics',
      description: 'Comprehensive operational dashboards showing peak delivery hours, average storage duration, courier distribution (Amazon, Flipkart, Blinkit), and completion rates.',
    },
    {
      icon: Building,
      title: 'Multi-Tenant Isolation',
      description: 'Strict Supabase PostgreSQL Row Level Security (RLS) ensures zero data leakage between different apartment societies, blocks, and resident units.',
    },
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Platform Capabilities</span>
        <h1 className="text-4xl font-extrabold text-navy-950 tracking-tight">
          Everything required to run modern apartment parcel logistics
        </h1>
        <p className="text-slate-600 text-sm">
          From the main gate security desk to the resident&apos;s living room, ParcelEase provides end-to-end accountability, security, and convenience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featureList.map((f, i) => {
          const Icon = f.icon;
          return (
            <Card key={i} className="hover:border-blue-300 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-navy-950">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="rounded-2xl bg-navy-950 text-white p-8 sm:p-12 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold">Experience the workflow right now</h2>
        <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
          No sign-up or credit card required. Use our interactive demo switchers to test staff parcel intake and resident slot bookings immediately.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/staff/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 font-semibold text-xs sm:text-sm">
              Try Parcel Registration
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="border-slate-700 bg-slate-800 text-white text-xs sm:text-sm">
              Explore Society Plans
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
