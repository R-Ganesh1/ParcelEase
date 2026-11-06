import React from 'react';
import Link from 'next/link';
import { Check, ShieldCheck, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter Society',
      price: '₹2,999',
      billing: 'per society / month',
      perApt: '~₹30 / apartment',
      description: 'Ideal for boutique apartments and standalone societies with up to 100 units.',
      features: [
        'Up to 100 apartment units',
        'Unlimited guard desk parcel intake',
        'Resident in-app & push notifications',
        'Self-collection 30-min slot bookings',
        'Single-use 6-digit OTP verification',
        'Standard 7-day retention alerts',
        'Basic operational reports & CSV export',
      ],
      cta: 'Start 30-Day Pilot',
      highlighted: false,
    },
    {
      name: 'Growth Community',
      price: '₹5,999',
      billing: 'per society / month',
      perApt: '~₹20 / apartment',
      description: 'For standard gated communities with multiple towers and up to 300 units.',
      badge: 'Most Popular',
      features: [
        'Up to 300 apartment units',
        'Multi-gate security guard support',
        'Scheduled Doorstep Delivery routing',
        'Custom slot duration & capacity rules',
        'Peak hours & courier analytics dashboard',
        'Automated SMS & WhatsApp gateway sync',
        'Customizable RWA retention policies',
        'Dedicated onboarding support',
      ],
      cta: 'Start 30-Day Pilot',
      highlighted: true,
    },
    {
      name: 'Enterprise Township',
      price: '₹11,999',
      billing: 'per society / month',
      perApt: 'Custom volume pricing',
      description: 'For large townships and integrated residential complexes with 1,000+ units.',
      features: [
        'Unlimited apartments & towers',
        'Multi-entry vehicle gate coordination',
        'Smart automated parcel locker API integration',
        'Priority SLA with 24/7 dedicated support',
        'Custom security guard workflow training',
        'Single Sign-On (SSO) with society ERPs',
        'Full tenant isolation & compliance audit',
      ],
      cta: 'Contact Enterprise Sales',
      highlighted: false,
    },
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Illustrative Pricing Plans</span>
        <h1 className="text-4xl font-extrabold text-navy-950 tracking-tight">
          Affordable, transparent pricing for every Indian society
        </h1>
        <p className="text-slate-600 text-sm">
          Simple per-society monthly subscriptions. Less than the cost of a single cup of tea per apartment per month.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((p, idx) => (
          <Card
            key={idx}
            className={`flex flex-col justify-between relative ${
              p.highlighted
                ? 'border-2 border-blue-600 shadow-xl ring-4 ring-blue-500/10'
                : 'border border-slate-200'
            }`}
          >
            {p.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-600 text-white font-bold py-1 px-3 shadow-md">{p.badge}</Badge>
              </div>
            )}

            <CardHeader className="pt-8">
              <CardTitle className="text-xl font-bold">{p.name}</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1 min-h-[36px]">
                {p.description}
              </CardDescription>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-navy-950">{p.price}</span>
                  <span className="text-xs text-slate-500">{p.billing}</span>
                </div>
                <div className="text-xs font-semibold text-blue-600 mt-1">{p.perApt}</div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 flex-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Included Features</span>
              <ul className="space-y-2.5 text-xs text-slate-600">
                {p.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="pt-4">
              <Link href="/login" className="w-full">
                <Button
                  className={`w-full font-semibold text-xs sm:text-sm ${
                    p.highlighted
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-navy-900 hover:bg-navy-800 text-white'
                  }`}
                >
                  {p.cta}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pricing FAQ & Note */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>Note on MVP Billing & Deployment</span>
        </div>
        <p>
          Plans shown above represent the production subscription architecture. In this demonstration environment,
          all premium features (doorstep scheduling, analytics, SMS hooks) are fully unlocked for evaluation purposes without payment gateway credentials.
        </p>
      </div>
    </div>
  );
}
