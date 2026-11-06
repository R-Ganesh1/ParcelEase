'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, CheckCircle2, Building2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Contact &amp; Onboarding</span>
        <h1 className="text-4xl font-extrabold text-navy-950">Let&apos;s bring ParcelEase to your society</h1>
        <p className="text-slate-600 text-sm">
          Interested in scheduling an RWA committee demonstration or setting up a 30-day pilot?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-5 space-y-6">
          <Card className="bg-navy-950 text-white border-0 shadow-lg">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-bold text-lg text-white">ParcelEase Headquarters</h3>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Bengaluru Innovation Hub</strong>
                    <span>4th Floor, Salarpuria Softzone, Green Glen Layout, Bellandur, Bengaluru, KA 560103</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>+91 (80) 4920-8000 / 1800-PARCEL</span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>support@parcelease.in</span>
                </div>
              </div>

              <div className="pt-4 border-t border-navy-800 text-[11px] text-slate-400 leading-relaxed">
                Dedicated support available Monday – Saturday, 08:00 AM to 09:30 PM IST for security guards and society estate managers.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Request an Onsite Demonstration</CardTitle>
              <CardDescription className="text-xs">
                We will contact your Resident Welfare Association within 2 business hours
              </CardDescription>
            </CardHeader>

            <CardContent>
              {submitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-navy-950 text-base">Inquiry Submitted</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Thank you! Our Bengaluru community manager will reach out with a customized deployment plan.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="space-y-4 text-xs"
                >
                  <Input label="Your Full Name" placeholder="e.g. Rajesh Kumar" required />
                  <Input label="Society / Apartment Name" placeholder="e.g. Prestige Lakeside Habitat" required />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Phone Number" placeholder="+91 98765 43210" required />
                    <Input label="Email Address" type="email" placeholder="rwa@society.com" required />
                  </div>
                  <Input label="Total Number of Apartment Units" placeholder="e.g. 240 units" required />
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-10">
                    <Send className="w-3.5 h-3.5 mr-1.5" /> Submit Pilot Request
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
