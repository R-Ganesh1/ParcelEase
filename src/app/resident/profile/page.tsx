'use client';

import React, { useState } from 'react';
import { User, Bell, Shield, Save, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDemo } from '@/lib/context/demo-context';

export default function ResidentProfilePage() {
  const { currentUser, society } = useDemo();
  const user = currentUser || {
    id: 'user-resident-1',
    full_name: 'Ananya Rao',
    email: 'ananya@greenwood.in',
    phone: '+91 98450 11223',
    role: 'RESIDENT' as const,
    apartment_number: 'A-204',
    society_id: 'soc-1',
    created_at: new Date().toISOString(),
  };

  const [phone, setPhone] = useState(user.phone);
  const [saved, setSaved] = useState(false);

  // Notification Preferences
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [waEnabled, setWaEnabled] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-950">Apartment Profile &amp; Preferences</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage resident contact details and notification delivery channels
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Resident Account Information</CardTitle>
          <CardDescription className="text-xs">
            Linked to Apartment {user.apartment_number || 'A-204'} at {society.name}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Full Name" value={user.full_name} disabled />
            <Input label="Registered Email" value={user.email} disabled />
            <Input
              label="Contact Phone (For SMS/WhatsApp OTP alerts)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input label="Apartment Unit" value={user.apartment_number || 'A-204'} disabled />

            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Notification Channels
              </span>

              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushEnabled}
                    onChange={(e) => setPushEnabled(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>In-App Real-time Arrival Alerts (Recommended)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsEnabled}
                    onChange={(e) => setSmsEnabled(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>SMS Fallback for Uncollected Parcels</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={waEnabled}
                    onChange={(e) => setWaEnabled(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>WhatsApp Pickup Reminder Pass</span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {saved && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Preferences Saved!
                </span>
              )}
              <Button type="submit" size="sm" className="ml-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs">
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
