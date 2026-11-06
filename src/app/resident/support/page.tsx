'use client';

import React, { useState } from 'react';
import { HelpCircle, AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDemo } from '@/lib/context/demo-context';

export default function ResidentSupportPage() {
  const { currentUser, society } = useDemo();
  const [category, setCategory] = useState<'MISSING_PARCEL' | 'DAMAGED_PARCEL' | 'DELAYED_DELIVERY' | 'GENERAL'>('MISSING_PARCEL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-950">RWA Parcel Help &amp; Support</h1>
        <p className="text-xs text-slate-500 mt-1">
          Raise inquiries or report missing/damaged packages to {society.name} committee
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Submit a Parcel Ticket</CardTitle>
              <CardDescription className="text-xs">
                Directly escalated to society admin Dr. Arvind Sharma and gate supervisor
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-navy-950 text-base">Ticket Logged Successfully</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Ticket #TKT-8921 has been registered. Security desk supervisor has been alerted to review CCTV footage and intake logs.
              </p>
              <Button onClick={() => setSubmitted(false)} variant="outline" size="sm" className="text-xs">
                Submit Another Request
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Inquiry Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800"
                >
                  <option value="MISSING_PARCEL">Missing Parcel (Courier claims delivered)</option>
                  <option value="DAMAGED_PARCEL">Damaged Box / Torn Packaging</option>
                  <option value="DELAYED_DELIVERY">Doorstep Delivery Delay</option>
                  <option value="GENERAL">General Society Parcel Inquiry</option>
                </select>
              </div>

              <Input
                label="Summary / Parcel Reference"
                placeholder="e.g. Amazon box marked delivered by courier but not at gate"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Detailed Explanation *
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide tracking number, expected delivery time, courier name, etc."
                  className="w-full p-3 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-10">
                <Send className="w-3.5 h-3.5 mr-1.5" /> Submit Support Ticket
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
