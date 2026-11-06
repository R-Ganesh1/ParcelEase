import React from 'react';
import Link from 'next/link';
import { Package, Smartphone, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Courier Delivers to Gate Desk',
      actor: 'Security Staff',
      description:
        'When courier agents arrive with deliveries from Amazon, Flipkart, Blinkit, or Blue Dart, authorized security personnel receive them and log the apartment number and tracking code.',
      details: [
        'Selects apartment from verified resident directory',
        'System generates unique reference (e.g., PE-2026-A204-4190)',
        'Storage location assigned (e.g., Bay 2, Shelf C)',
        'Instant tamper-evident QR code created',
      ],
    },
    {
      num: '02',
      title: 'Automated In-App Notification',
      actor: 'Resident',
      description:
        'The resident receives an instantaneous push/in-app alert informing them that their package has safely arrived at Gate 1.',
      details: [
        'Displays courier name, arrival timestamp in IST',
        'Shows package photo and bay location',
        'Eliminates uncoordinated calls during office meetings',
      ],
    },
    {
      num: '03',
      title: 'Flexible Pickup or Doorstep Scheduling',
      actor: 'Resident & System',
      description:
        'The resident selects a convenient 30-minute self-collection window or requests an evening doorstep delivery slot.',
      details: [
        'Prevents overbooking with dynamic capacity caps (max 4 per slot)',
        'Accounts for society guard shifts and gate operating hours',
        'Generates single-use 6-digit cryptographic collection pass',
      ],
    },
    {
      num: '04',
      title: 'Secure OTP Handover & Audit Trail',
      actor: 'Resident & Staff',
      description:
        'The resident shows their OTP at the desk. Guard inputs the OTP into the ParcelEase terminal, which verifies and logs the handover with an immutable timestamp.',
      details: [
        'OTPs expire after 15 minutes to prevent pass forwarding leaks',
        'Brute-force lockout after 3 incorrect attempts',
        'Handover details instantly updated across resident and admin dashboards',
      ],
    },
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">End-to-End Workflow</span>
        <h1 className="text-4xl font-extrabold text-navy-950 tracking-tight">
          How ParcelEase works in 4 simple steps
        </h1>
        <p className="text-slate-600 text-sm">
          A seamless bridge connecting courier delivery agents, society security guards, and apartment residents.
        </p>
      </div>

      <div className="space-y-12">
        {steps.map((step, idx) => (
          <div
            key={step.num}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 rounded-2xl border ${
              idx % 2 === 0 ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="lg:col-span-2 text-center lg:text-left">
              <span className="text-5xl font-black text-blue-600/30">{step.num}</span>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mt-1">
                {step.actor}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-2">
              <h3 className="text-2xl font-bold text-navy-950">{step.title}</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{step.description}</p>
            </div>

            <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key Safeguards</span>
              <ul className="space-y-2">
                {step.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-8">
        <Link href="/register">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-500 font-semibold text-sm">
            Get Started with ParcelEase <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
