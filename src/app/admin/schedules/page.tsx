'use client';

import React, { useState } from 'react';
import { Clock, Save, Check, Settings, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDemo } from '@/lib/context/demo-context';

export default function AdminSchedulesPage() {
  const { society, refreshState } = useDemo();

  const [startTime, setStartTime] = useState(society.operating_hours.start);
  const [endTime, setEndTime] = useState(society.operating_hours.end);
  const [slotDuration, setSlotDuration] = useState(society.slot_duration_minutes);
  const [slotCapacity, setSlotCapacity] = useState(society.slot_capacity);
  const [doorstepEnabled, setDoorstepEnabled] = useState(society.doorstep_delivery_enabled);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    society.operating_hours.start = startTime;
    society.operating_hours.end = endTime;
    society.slot_duration_minutes = Number(slotDuration);
    society.slot_capacity = Number(slotCapacity);
    society.doorstep_delivery_enabled = doorstepEnabled;

    setSaved(true);
    refreshState();
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-950">Operating Hours &amp; Slot Engine Setup</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure security gate pickup hours, pickup concurrency limits, and doorstep routing
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-base font-bold">Gate Operating Schedule (IST)</CardTitle>
              <CardDescription className="text-xs">
                Residents can only book collection windows within these times
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Operating Start Time (IST)"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />

              <Input
                label="Operating End Time (IST)"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Slot Duration (Minutes)
                </label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes (Recommended)</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Max Pickups Per Slot (Capacity Cap)
                </label>
                <select
                  value={slotCapacity}
                  onChange={(e) => setSlotCapacity(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800"
                >
                  <option value={2}>2 Pickups / Slot</option>
                  <option value={3}>3 Pickups / Slot</option>
                  <option value={4}>4 Pickups / Slot (Standard)</option>
                  <option value={6}>6 Pickups / Slot (High Capacity)</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Prevents security gate congestion during evening peak hours
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={doorstepEnabled}
                  onChange={(e) => setDoorstepEnabled(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-navy-950 block">Enable Scheduled Doorstep Delivery</span>
                  <span className="text-slate-500 text-[11px]">
                    Allows residents to request staff doorstep drop-offs for heavy or oversized parcels
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {saved && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Schedule parameters updated!
                </span>
              )}
              <Button type="submit" className="ml-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-10">
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save Operating Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
