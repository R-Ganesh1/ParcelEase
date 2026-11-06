'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Building,
  Bell,
  Sparkles,
  QrCode,
  Truck,
  Users,
  Home,
  Building2,
  Globe,
  UserPlus,
  LogIn,
  KeyRound,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('RESIDENT');

  const roleDetails = [
    {
      id: 'RESIDENT' as UserRole,
      title: 'Apartment Resident',
      badge: 'Most Popular',
      icon: Home,
      accent: 'emerald',
      colorBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description:
        'Track incoming shipments from Amazon, Flipkart, Blinkit & Blue Dart. Schedule 30-minute self-pickup passes or request doorstep delivery.',
      dashboardUrl: '/resident',
      features: [
        'Instant in-app alerts when shipments reach security gate',
        'Book 30-min pickup time windows within operating hours',
        'Contactless 6-digit cryptographic single-use OTP pass',
        'Report missing or damaged courier boxes to RWA',
      ],
      defaultEmail: 'resident@parcelease.in',
    },
    {
      id: 'STAFF' as UserRole,
      title: 'Security Guard / Staff',
      badge: 'Gate Terminal',
      icon: ShieldCheck,
      accent: 'blue',
      colorBg: 'bg-blue-50 text-blue-700 border-blue-200',
      description:
        'Receive parcels from courier executives in under 30 seconds. Verify resident OTP passes at the desk with zero lost package disputes.',
      dashboardUrl: '/staff',
      features: [
        'Autocomplete apartment directory & recipient lookup',
        'Assign storage racks (Bay 1, Bay 2 Shelf C, etc.)',
        'Generate instant parcel references & QR scan codes',
        'Rate-limited OTP verification with immutable audit stamps',
      ],
      defaultEmail: 'staff@parcelease.in',
    },
    {
      id: 'SOCIETY_ADMIN' as UserRole,
      title: 'Society Admin (RWA)',
      badge: 'Management',
      icon: Building2,
      accent: 'amber',
      colorBg: 'bg-amber-50 text-amber-700 border-amber-200',
      description:
        'Complete parcel visibility for Resident Welfare Associations, estate managers, and facility management committees.',
      dashboardUrl: '/admin',
      features: [
        'Real-time dashboards: daily volume & collection rates',
        'Peak arrival hours analytics to optimize guard shifts',
        'Configurable gate operating hours & slot capacity caps',
        'Exportable CSV custody ledger for association AGMs',
      ],
      defaultEmail: 'admin@parcelease.in',
    },
    {
      id: 'PLATFORM_ADMIN' as UserRole,
      title: 'Platform Super Admin',
      badge: 'Headquarters',
      icon: Globe,
      accent: 'purple',
      colorBg: 'bg-purple-50 text-purple-700 border-purple-200',
      description:
        'Supervise multiple gated residential communities and townships across Bengaluru, Mumbai, Delhi NCR, and Hyderabad.',
      dashboardUrl: '/platform-admin',
      features: [
        'Multi-tenant PostgreSQL Row Level Security (RLS) enforcement',
        'Provision and onboard new apartment societies in minutes',
        'Platform-wide parcel volume & SaaS subscription metrics',
        'System-wide audit event logs and security checks',
      ],
      defaultEmail: 'platform@parcelease.in',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-slate-900 text-white pt-16 pb-20 lg:pt-20 lg:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apartment Parcel Management &amp; Scheduled Delivery Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Your parcels. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
              Your time.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Choose your role to sign in to your dedicated dashboard or register a new account.
            Built for residents, security guards, RWAs, and property managers in India.
          </p>

          {/* Quick CTA row */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="#select-role">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25">
                Select Your Role Below <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>

            <Link href="/register">
              <Button size="lg" variant="outline" className="border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700 text-sm font-semibold">
                <UserPlus className="w-4 h-4 mr-1.5 text-emerald-400" /> New Registration
              </Button>
            </Link>

            <Link href="/login">
              <Button size="lg" variant="outline" className="border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700 text-sm font-semibold">
                <LogIn className="w-4 h-4 mr-1.5 text-blue-400" /> Existing User Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CORE FEATURE: Interactive Role Selection Hub */}
      <section id="select-role" className="py-16 bg-slate-50 border-b border-slate-200 px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Choose Your Portal</span>
            <h2 className="text-3xl font-extrabold text-navy-950">
              Select Your Role to Sign In or Register
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Each persona features a tailored interface and operational dashboard. New users can register immediately.
            </p>
          </div>

          {/* 4 Dedicated Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roleDetails.map((role) => {
              const Icon = role.icon;
              return (
                <Card
                  key={role.id}
                  className="flex flex-col justify-between hover:shadow-xl hover:border-blue-300 transition-all duration-200 bg-white border-2 border-slate-200 relative group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-3 rounded-xl ${role.colorBg}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${role.colorBg}`}>
                        {role.badge}
                      </span>
                    </div>

                    <CardTitle className="text-lg font-bold text-navy-950">{role.title}</CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-1 min-h-[50px] leading-relaxed">
                      {role.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1">
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Key Capabilities
                      </span>
                      <ul className="space-y-2 text-xs text-slate-600">
                        {role.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-[11px] leading-snug">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>

                  <div className="p-5 pt-0 space-y-2">
                    {/* Action 1: Sign in with credentials */}
                    <Link href={`/login?role=${role.id}`} className="block w-full">
                      <Button
                        className="w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs h-10 shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Sign In as {role.title}
                      </Button>
                    </Link>

                    {/* Action 2: Register for this role */}
                    <Link href={`/register?role=${role.id}`} className="block w-full">
                      <Button
                        variant="outline"
                        className="w-full text-slate-800 hover:bg-slate-50 border-slate-300 font-semibold text-xs h-10 flex items-center justify-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-blue-600" /> Register as {role.title}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Dedicated Fast Gateway Card for returning users */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
                  <KeyRound className="w-4 h-4" />
                  <span>Credential-Based Secure Access</span>
                </div>
                <h3 className="text-2xl font-bold text-navy-950">
                  Already have an account? Sign in with your registered email
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Enter your email and password to open your apartment portal or guard desk. If your email is not yet registered, our system immediately assists you in setting up your profile.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Role-Based Access Control
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Multi-Tenant Data Isolation
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Bank-Grade OTP Handover
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
                <Link href="/login" className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm h-12 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" /> Open Account Sign In
                  </Button>
                </Link>

                <Link href="/register" className="w-full">
                  <Button variant="outline" className="w-full border-slate-300 text-slate-800 hover:bg-slate-50 font-bold text-sm h-12 flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4 text-blue-600" /> Create New User Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Indian Society Workflow */}
      <section className="py-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Frictionless Workflow</span>
            <h2 className="text-3xl font-bold text-navy-950 mt-2">
              How ParcelEase transforms gated society deliveries
            </h2>
            <p className="text-slate-600 mt-3 text-sm">
              Built specifically around the operational realities of Indian apartment security staff and busy working residents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
                  01
                </div>
                <h3 className="font-bold text-lg text-navy-950 mb-2">Gate Reception &amp; Intake</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Security scans or enters the tracking number, selects apartment A-204, records parcel count, and assigns a designated storage bay. Takes under 30 seconds.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg mb-4">
                  02
                </div>
                <h3 className="font-bold text-lg text-navy-950 mb-2">Resident Alert &amp; Scheduling</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  The resident gets an instant in-app notification. From their phone, they pick a 30-minute self-collection window or request doorstep delivery when supported.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4">
                  03
                </div>
                <h3 className="font-bold text-lg text-navy-950 mb-2">Verified OTP Handover</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Resident shows a single-use 6-digit OTP pass. Security inputs the OTP to complete the handover. An immutable audit trail with timestamp is instantly recorded.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
