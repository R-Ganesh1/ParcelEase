'use client';

import React, { useState } from 'react';
import { Settings, Save, Check, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDemo } from '@/lib/context/demo-context';

export default function AdminSettingsPage() {
  const { society, refreshState } = useDemo();

  const [retentionDays, setRetentionDays] = useState(society.retention_days || 7);
  const [requirePhoto, setRequirePhoto] = useState(false);
  const [smsGateway, setSmsGateway] = useState('mock');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    society.retention_days = Number(retentionDays);
    setSaved(true);
    refreshState();
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-950">Society Settings &amp; Policies</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure parcel retention period, intake photo requirements, and external alerts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Parcel Retention &amp; Escalation Rules</CardTitle>
          <CardDescription className="text-xs">
            Policies defined by {society.name} management committee
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Maximum Parcel Holding Duration (Days) *
              </label>
              <select
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800"
              >
                <option value={3}>3 Days (Aggressive de-clutter)</option>
                <option value={7}>7 Days (Standard RWA Rule)</option>
                <option value={14}>14 Days (Extended Vacation)</option>
                <option value={30}>30 Days (Maximum)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Parcels exceeding this threshold without resident booking are automatically flagged as OVERDUE.
              </span>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={requirePhoto}
                  onChange={(e) => setRequirePhoto(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-navy-950 block">Mandatory Package Photograph at Intake</span>
                  <span className="text-slate-500 text-[11px]">
                    Requires guards to capture box condition before completing intake
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {saved && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Policy rules saved!
                </span>
              )}
              <Button type="submit" className="ml-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-10">
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save Policies
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
